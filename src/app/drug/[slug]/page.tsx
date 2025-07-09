'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchAdverseEvents, fetchDrugInfo, getManufacturerData, getTimeSeriesData } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building, TrendingUp, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DrugDetailPage() {
  const params = useParams();
  const drugSlug = params.slug as string;
  const drugName = decodeURIComponent(drugSlug);

  // Fetch adverse events data for this specific drug
  const {
    data: adverseEventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useQuery({
    queryKey: ['drugAdverseEvents', drugName],
    queryFn: () => fetchAdverseEvents({
      drugName: drugName,
      limit: 1000, // Get more data for detailed analysis
    }),
    enabled: !!drugName,
  });

  // Fetch detailed drug information from Drugs@FDA API
  const {
    data: drugInfoData,
    isLoading: isLoadingDrugInfo,
    error: drugInfoError,
  } = useQuery({
    queryKey: ['drugInfo', drugName],
    queryFn: () => fetchDrugInfo({
      drugName: drugName,
      limit: 100,
    }),
    enabled: !!drugName,
  });

  const manufacturerData = adverseEventsData ? getManufacturerData(adverseEventsData.results) : [];
  const timeSeriesData = adverseEventsData ? getTimeSeriesData(adverseEventsData.results) : [];

  const totalEvents = adverseEventsData?.results?.length || 0;
  const seriousEvents = adverseEventsData?.results?.filter(report => 
    report.serious === '1' || 
    report.seriousnessdeath === '1' || 
    report.seriousnesshospitalization === '1' || 
    report.seriousnesslifethreatening === '1'
  ).length || 0;

  // Combine manufacturer data from both APIs
  const combinedManufacturerData = () => {
    const manufacturers: Record<string, number> = {};
    
    // Add data from adverse events
    manufacturerData.forEach(item => {
      manufacturers[item.manufacturer] = (manufacturers[item.manufacturer] || 0) + item.count;
    });
    
    // Add data from drug info API
    if (drugInfoData?.results) {
      drugInfoData.results.forEach(drug => {
        if (drug.sponsor_name) {
          manufacturers[drug.sponsor_name] = (manufacturers[drug.sponsor_name] || 0) + 1;
        }
      });
    }
    
    return Object.entries(manufacturers)
      .map(([manufacturer, count]) => ({ manufacturer, count }))
      .sort((a, b) => b.count - a.count);
  };

  const isLoading = isLoadingEvents || isLoadingDrugInfo;
  const error = eventsError || drugInfoError;
  
  // Check if no data was found
  const noDataFound = !isLoading && !error && totalEvents === 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading drug analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <span className="ml-2 text-red-600">
              Error loading drug data. Please try again.
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (noDataFound) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{drugName}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            Drug Analytics
          </span>
        </div>
        
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
                No adverse event data was found for {drugName}. This could mean:
              </p>
              <ul className="text-sm text-gray-500 space-y-1 mb-4">
                <li>• The drug name might be misspelled</li>
                <li>• The drug might not be in the FDA database</li>
                <li>• There might be no reported adverse events for this drug</li>
              </ul>
              <p className="text-sm text-gray-500">
                Try searching for a different drug or check the spelling
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{drugName}</h1>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            Drug Analytics
          </span>
        </div>
        
        <p className="text-gray-600">
          Detailed analysis of adverse event reports for {drugName}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Serious Events</p>
                <p className="text-2xl font-bold text-red-600">{seriousEvents.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Serious Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalEvents > 0 ? Math.round((seriousEvents / totalEvents) * 100) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manufacturer Ranking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Manufacturer Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {combinedManufacturerData().length > 0 ? (
              <div className="space-y-3">
                {combinedManufacturerData().slice(0, 10).map((item, index) => (
                  <div key={item.manufacturer} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <span className="font-medium text-gray-900">{item.manufacturer}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      {item.count.toLocaleString()} reports
                    </span>
                  </div>
                ))}
                {combinedManufacturerData().length > 10 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    Showing top 10 of {combinedManufacturerData().length} manufacturers
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No manufacturer data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Series Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Adverse Events Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeSeriesData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Events']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No time series data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Drug Information from Drugs@FDA API */}
      {drugInfoData?.results && drugInfoData.results.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Drug Information & Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Product Details</h4>
                <div className="space-y-2">
                  {drugInfoData.results.slice(0, 5).map((drug, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{drug.sponsor_name}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {drug.application_number}
                        </span>
                      </div>
                      {drug.products.map((product, pIndex) => (
                        <div key={pIndex} className="text-sm text-gray-600 space-y-1">
                          <div><strong>Brand:</strong> {product.brand_name}</div>
                          <div><strong>Dosage Form:</strong> {product.dosage_form}</div>
                          <div><strong>Route:</strong> {product.route}</div>
                          <div><strong>Status:</strong> {product.marketing_status}</div>
                          {product.active_ingredients.map((ingredient, iIndex) => (
                            <div key={iIndex}>
                              <strong>Active Ingredient:</strong> {ingredient.name} ({ingredient.strength})
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission History */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Recent Submissions</h4>
                <div className="space-y-2">
                  {drugInfoData.results.slice(0, 3).map((drug, index) => (
                    <div key={index}>
                      {drug.submissions.slice(0, 5).map((submission, sIndex) => (
                        <div key={sIndex} className="p-3 bg-gray-50 rounded-lg mb-2">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{submission.submission_type}</span>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {submission.submission_status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Date:</strong> {new Date(submission.submission_status_date).toLocaleDateString()}</div>
                            {submission.submission_class_code_description && (
                              <div><strong>Type:</strong> {submission.submission_class_code_description}</div>
                            )}
                            {submission.review_priority && (
                              <div><strong>Priority:</strong> {submission.review_priority}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
