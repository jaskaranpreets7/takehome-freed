'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchDrugs from '@/components/SearchDrugs';
import DrugCard from '@/components/DrugCard';
import { fetchAdverseEvents, AdverseEventReport } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

interface SearchFilters {
  drugName: string;
  pharmacologicalClass: string;
  administrationRoute: string;
  seriousness: string[];
}

interface DrugSummary {
  drugName: string;
  totalEvents: number;
  seriousEvents: number;
  administrationRoutes: string[];
  pharmacologicalClass: string;
  drugSlug: string;
}

export default function DashboardPage() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    drugName: '',
    pharmacologicalClass: '',
    administrationRoute: '',
    seriousness: [],
  });
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch adverse events data
  const {
    data: adverseEventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useQuery({
    queryKey: ['adverseEvents', searchFilters],
    queryFn: () => fetchAdverseEvents({
      drugName: searchFilters.drugName || undefined,
      seriousness: searchFilters.seriousness.length > 0 ? searchFilters.seriousness : undefined,
      limit: 100,
    }),
    enabled: hasSearched, // Always enable when searched, even without filters
  });

  // Note: We're now using adverse events data for both drug info and events
  // The drug info API is kept for potential future use but not currently used

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setHasSearched(true);
  };

      // Process data to create drug summaries
    const getDrugSummaries = (): DrugSummary[] => {
      if (!adverseEventsData?.results) {
        return [];
      }

    const drugEventCounts: Record<string, { total: number; serious: number }> = {};
    const drugRoutes: Record<string, Set<string>> = {};
    const drugClasses: Record<string, string> = {};

    // Process adverse events data
    adverseEventsData.results.forEach((report: AdverseEventReport) => {
      report.patient.drug.forEach(drug => {
        if (drug.medicinalproduct) {
          const drugName = drug.medicinalproduct.toLowerCase();
          if (!drugEventCounts[drugName]) {
            drugEventCounts[drugName] = { total: 0, serious: 0 };
          }
          drugEventCounts[drugName].total++;
          
          // Check if serious
          if (report.serious === '1' || 
              report.seriousnessdeath === '1' || 
              report.seriousnesshospitalization === '1' || 
              report.seriousnesslifethreatening === '1') {
            drugEventCounts[drugName].serious++;
          }
        }
      });
    });

    // Process drug info data from adverse events (since drug info API might not have the same drugs)
    adverseEventsData.results.forEach((report: AdverseEventReport) => {
      report.patient.drug.forEach(drug => {
        if (drug.medicinalproduct) {
          const drugName = drug.medicinalproduct.toLowerCase();
          if (!drugRoutes[drugName]) {
            drugRoutes[drugName] = new Set();
          }
          if (drug.drugadministrationroute) {
            drugRoutes[drugName].add(drug.drugadministrationroute);
          }
          // Use pharmacological class from openfda if available
          if (drug.openfda?.pharm_class_epc && drug.openfda.pharm_class_epc.length > 0) {
            drugClasses[drugName] = drug.openfda.pharm_class_epc[0];
          }
        }
      });
    });

    // Combine data into summaries
    return Object.entries(drugEventCounts).map(([drugName, counts]) => ({
      drugName: drugName.charAt(0).toUpperCase() + drugName.slice(1),
      totalEvents: counts.total,
      seriousEvents: counts.serious,
      administrationRoutes: Array.from(drugRoutes[drugName] || []),
      pharmacologicalClass: drugClasses[drugName] || 'Unknown',
      drugSlug: encodeURIComponent(drugName),
    })).sort((a, b) => b.totalEvents - a.totalEvents);
  };

  const drugSummaries = getDrugSummaries();
  const isLoading = isLoadingEvents;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          FDA Adverse Event Insights Dashboard
        </h1>
        <p className="text-gray-600">
          Search and analyze drug-related adverse event reports from the FDA database
        </p>
      </div>

      {/* Search Component */}
      <div className="mb-8">
        <SearchDrugs onSearch={handleSearch} isLoading={isLoading} />
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading drug data...</span>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {eventsError && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <span className="ml-2 text-red-600">
                  Error loading data. Please try again.
                </span>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {!isLoading && !eventsError && (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Search Results
                </h2>
                <span className="text-gray-600">
                  {drugSummaries.length} drug{drugSummaries.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {/* Drug Cards Grid */}
              {drugSummaries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {drugSummaries.map((drug, index) => (
                    <DrugCard
                      key={`${drug.drugName}-${index}`}
                      drugName={drug.drugName}
                      totalEvents={drug.totalEvents}
                      seriousEvents={drug.seriousEvents}
                      administrationRoutes={drug.administrationRoutes}
                      pharmacologicalClass={drug.pharmacologicalClass}
                      drugSlug={drug.drugSlug}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Data Found
                      </h3>
                      <p className="text-gray-600 mb-4 max-w-md">
                        No adverse event data was found for your search criteria. This could mean:
                      </p>
                      <ul className="text-sm text-gray-500 space-y-1 mb-4">
                        <li>• The drug name might be misspelled</li>
                        <li>• The drug might not be in the FDA database</li>
                        <li>• Try using a different drug name or broader search terms</li>
                      </ul>
                      <p className="text-sm text-gray-500">
                        Try searching for common drugs like Aspirin, Ibuprofen, or Metformin
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Use the search bar above to find drug adverse event data. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Search by drug name to find specific medications</li>
              <li>Filter by pharmacological class or administration route</li>
              <li>Focus on serious events like death, hospitalization, or life-threatening conditions</li>
              <li>Click on any drug card to view detailed analytics</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
