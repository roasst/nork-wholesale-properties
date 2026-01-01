import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PropertyFilters, PropertyType } from '../types';
import { useFilterOptions } from '../hooks/useFilterOptions';

interface FilterBarProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
}

const PROPERTY_TYPES: PropertyType[] = ['SFR', 'Duplex', 'Triplex', 'Quad', 'Multi-Family', 'Commercial', 'Condo', 'Townhome', 'Vacant Land', 'Other'];

export const FilterBar = ({ filters, onFiltersChange }: FilterBarProps) => {
  const [selectedState, setSelectedState] = useState(filters.state || '');
  const { options } = useFilterOptions(selectedState || undefined);

  useEffect(() => {
    setSelectedState(filters.state || '');
  }, [filters.state]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    onFiltersChange({
      ...filters,
      state: state || undefined,
      city: undefined,
      county: undefined,
    });
  };

  const handleCityChange = (city: string) => {
    onFiltersChange({
      ...filters,
      city: city || undefined,
    });
  };

  const handleCountyChange = (county: string) => {
    onFiltersChange({
      ...filters,
      county: county || undefined,
    });
  };

  const handleZipChange = (zip: string) => {
    onFiltersChange({
      ...filters,
      zip_code: zip || undefined,
    });
  };

  const handleMinPriceChange = (price: string) => {
    onFiltersChange({
      ...filters,
      minPrice: price ? Number(price) : undefined,
    });
  };

  const handleMaxPriceChange = (price: string) => {
    onFiltersChange({
      ...filters,
      maxPrice: price ? Number(price) : undefined,
    });
  };

  const handlePropertyTypeToggle = (type: PropertyType) => {
    const currentTypes = filters.propertyTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];

    onFiltersChange({
      ...filters,
      propertyTypes: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleClearFilters = () => {
    setSelectedState('');
    onFiltersChange({});
  };

  return (
    <div className="bg-white shadow-md p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Filter Properties</h2>
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <X size={16} />
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All States</option>
            {options.states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <select
            value={filters.city || ''}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!selectedState}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          >
            <option value="">All Cities</option>
            {options.cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
          <select
            value={filters.county || ''}
            onChange={(e) => handleCountyChange(e.target.value)}
            disabled={!selectedState}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
          >
            <option value="">All Counties</option>
            {options.counties.map(county => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
          <input
            type="text"
            value={filters.zip_code || ''}
            onChange={(e) => handleZipChange(e.target.value)}
            placeholder="Enter zip code"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
          <input
            type="number"
            value={filters.minPrice || ''}
            onChange={(e) => handleMinPriceChange(e.target.value)}
            placeholder="$0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
          <input
            type="number"
            value={filters.maxPrice || ''}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            placeholder="Any"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map(type => (
            <button
              key={type}
              onClick={() => handlePropertyTypeToggle(type)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.propertyTypes?.includes(type)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
