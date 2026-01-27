/**
 * BroadcastFilters - Filter controls for property broadcast
 * Enhanced with address and wholesaler text search
 */

import { useState } from 'react';
import { Filter, X, ChevronDown, Search, MapPin, Users } from 'lucide-react';
import { PropertyType } from '../../../types';
import { PROPERTY_TYPES } from '../../utils/rolePermissions';

export interface BroadcastFilterValues {
  minPrice: number | null;
  maxPrice: number | null;
  city: string;
  county: string;
  propertyTypes: PropertyType[];
  status: string;
  addressSearch: string;
  wholesalerSearch: string;
}

interface BroadcastFiltersProps {
  filters: BroadcastFilterValues;
  onChange: (filters: BroadcastFilterValues) => void;
  availableCities: string[];
  availableCounties: string[];
  totalCount: number;
  filteredCount: number;
}

const PRICE_PRESETS = [
  { label: 'Any', min: null, max: null },
  { label: 'Under $100K', min: null, max: 100000 },
  { label: '$100K - $200K', min: 100000, max: 200000 },
  { label: '$200K - $300K', min: 200000, max: 300000 },
  { label: '$300K - $500K', min: 300000, max: 500000 },
  { label: 'Over $500K', min: 500000, max: null },
];

export const BroadcastFilters = ({
  filters,
  onChange,
  availableCities,
  availableCounties,
  totalCount,
  filteredCount,
}: BroadcastFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handlePricePreset = (min: number | null, max: number | null) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleCityChange = (city: string) => {
    onChange({ ...filters, city });
  };

  const handleCountyChange = (county: string) => {
    onChange({ ...filters, county });
  };

  const handleTypeToggle = (type: PropertyType) => {
    const currentTypes = filters.propertyTypes;
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onChange({ ...filters, propertyTypes: newTypes });
  };

  const handleStatusChange = (status: string) => {
    onChange({ ...filters, status });
  };

  const handleAddressSearchChange = (addressSearch: string) => {
    onChange({ ...filters, addressSearch });
  };

  const handleWholesalerSearchChange = (wholesalerSearch: string) => {
    onChange({ ...filters, wholesalerSearch });
  };

  const clearFilters = () => {
    onChange({
      minPrice: null,
      maxPrice: null,
      city: '',
      county: '',
      propertyTypes: [],
      status: '',
      addressSearch: '',
      wholesalerSearch: '',
    });
  };

  const hasActiveFilters =
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.city !== '' ||
    filters.county !== '' ||
    filters.propertyTypes.length > 0 ||
    filters.status !== '' ||
    filters.addressSearch !== '' ||
    filters.wholesalerSearch !== '';

  const activeFilterCount = [
    filters.minPrice !== null || filters.maxPrice !== null,
    filters.city !== '',
    filters.county !== '',
    filters.propertyTypes.length > 0,
    filters.status !== '',
    filters.addressSearch !== '',
    filters.wholesalerSearch !== '',
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <span className="font-semibold text-gray-800">Filter Properties</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#7CB342] text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {filteredCount} of {totalCount} properties
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Filters Body */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Search Row - Address and Wholesaler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={filters.addressSearch}
                  onChange={(e) => handleAddressSearchChange(e.target.value)}
                  placeholder="Enter street address..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent text-sm"
                />
                {filters.addressSearch && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddressSearchChange('');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Wholesaler Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Wholesaler
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={filters.wholesalerSearch}
                  onChange={(e) => handleWholesalerSearchChange(e.target.value)}
                  placeholder="Enter wholesaler name..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent text-sm"
                />
                {filters.wholesalerSearch && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWholesalerSearchChange('');
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex flex-wrap gap-2">
              {PRICE_PRESETS.map((preset) => {
                const isActive =
                  filters.minPrice === preset.min &&
                  filters.maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    onClick={() => handlePricePreset(preset.min, preset.max)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      isActive
                        ? 'bg-[#7CB342] border-[#7CB342] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#7CB342] hover:text-[#7CB342]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* City and County Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                value={filters.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
              >
                <option value="">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* County */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                County
              </label>
              <select
                value={filters.county}
                onChange={(e) => handleCountyChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
              >
                <option value="">All Counties</option>
                {availableCounties.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Property Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => {
                const isActive = filters.propertyTypes.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => handleTypeToggle(type)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      isActive
                        ? 'bg-[#7CB342] border-[#7CB342] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#7CB342] hover:text-[#7CB342]'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['', 'Available', 'Under Contract', 'pending'].map((status) => {
                const isActive = filters.status === status;
                const label = status === '' ? 'All' : status === 'pending' ? 'Pending' : status;
                return (
                  <button
                    key={status || 'all'}
                    onClick={() => handleStatusChange(status)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      isActive
                        ? 'bg-[#7CB342] border-[#7CB342] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#7CB342] hover:text-[#7CB342]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t">
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <X size={14} />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
