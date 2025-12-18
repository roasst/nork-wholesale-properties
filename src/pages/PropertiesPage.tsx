import { useState } from 'react';
import { PropertyFilters } from '../types';
import { useProperties } from '../hooks/useProperties';
import { FilterBar } from '../components/FilterBar';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';

export const PropertiesPage = () => {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const { properties, loading, error } = useProperties(filters);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Available Properties</h1>
          <p className="text-lg text-gray-600">
            {loading ? 'Loading properties...' : `${properties.length} properties available`}
          </p>
        </div>

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-xl mb-2">No properties match your filters</p>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};
