'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';

interface SearchFilters {
  drugName: string;
  pharmacologicalClass: string;
  administrationRoute: string;
  seriousness: string[];
}

interface SearchDrugsProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

const seriousnessOptions = [
  { value: 'death', label: 'Death' },
  { value: 'hospitalization', label: 'Hospitalization' },
  { value: 'life-threatening', label: 'Life-threatening' },
];

const routeOptions = [
  'ORAL',
  'INTRAVENOUS',
  'INTRAMUSCULAR',
  'SUBCUTANEOUS',
  'TOPICAL',
  'INHALATION',
  'OPHTHALMIC',
  'OTIC',
  'NASAL',
  'RECTAL',
  'VAGINAL',
  'TRANSDERMAL',
];

// Note: pharmClassOptions removed as pharmacological class filtering is not supported by the current FDA API

export default function SearchDrugs({ onSearch, isLoading = false }: SearchDrugsProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    drugName: '',
    pharmacologicalClass: '',
    administrationRoute: '',
    seriousness: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleSeriousnessChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      seriousness: prev.seriousness.includes(value)
        ? prev.seriousness.filter(s => s !== value)
        : [...prev.seriousness, value],
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Drug Adverse Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter drug name..."
            value={filters.drugName}
            onChange={(e) => setFilters(prev => ({ ...prev, drugName: e.target.value }))}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="icon"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            {/* Pharmacological Class - Disabled as not supported by API */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Pharmacological Class
              </label>
              <select
                value={filters.pharmacologicalClass}
                onChange={(e) => setFilters(prev => ({ ...prev, pharmacologicalClass: e.target.value }))}
                className="w-full p-2 border rounded-md bg-gray-100"
                disabled
              >
                <option value="">Not available in current API</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Pharmacological class filtering is not supported by the current FDA API
              </p>
            </div>

            {/* Administration Route */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Administration Route
              </label>
              <select
                value={filters.administrationRoute}
                onChange={(e) => setFilters(prev => ({ ...prev, administrationRoute: e.target.value }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Routes</option>
                {routeOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Seriousness Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Adverse Event Seriousness
              </label>
              <div className="space-y-2">
                {seriousnessOptions.map(option => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.seriousness.includes(option.value)}
                      onChange={() => handleSeriousnessChange(option.value)}
                      className="rounded"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
