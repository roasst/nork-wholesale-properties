/**
 * BroadcastPropertyGrid - Selectable property cards for broadcast
 */

import { Property } from '../../../types';
import { Check, ImageOff, MapPin, Home, DollarSign } from 'lucide-react';

interface BroadcastPropertyGridProps {
  properties: Property[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export const BroadcastPropertyGrid = ({
  properties,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
}: BroadcastPropertyGridProps) => {
  const allSelected = properties.length > 0 && selectedIds.size === properties.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < properties.length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Selection Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
        <div className="flex items-center gap-3">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
              allSelected
                ? 'bg-[#7CB342] border-[#7CB342]'
                : someSelected
                ? 'bg-[#7CB342]/50 border-[#7CB342]'
                : 'border-gray-300 hover:border-[#7CB342]'
            }`}
          >
            {(allSelected || someSelected) && (
              <Check size={14} className="text-white" strokeWidth={3} />
            )}
          </button>
          <span className="font-medium text-gray-700">
            {allSelected
              ? 'All selected'
              : selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : 'Select properties'}
          </span>
        </div>
        {selectedIds.size > 0 && (
          <button
            onClick={onDeselectAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Property Grid */}
      {properties.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Home size={48} className="mx-auto mb-3 text-gray-300" />
          <p>No properties match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {properties.map((property) => {
            const isSelected = selectedIds.has(property.id);
            return (
              <div
                key={property.id}
                onClick={() => onToggleSelect(property.id)}
                className={`relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#7CB342] shadow-lg ring-2 ring-[#7CB342]/20'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Selection Checkbox */}
                <div
                  className={`absolute top-2 left-2 z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                    isSelected
                      ? 'bg-[#7CB342] border-[#7CB342]'
                      : 'bg-white/90 border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  )}
                </div>

                {/* Property Image */}
                <div className="relative h-32 bg-gray-100">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.street_address}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff size={32} className="text-gray-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                      property.status === 'Available'
                        ? 'bg-green-100 text-green-800'
                        : property.status === 'Under Contract'
                        ? 'bg-yellow-100 text-yellow-800'
                        : property.status === 'pending'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {property.status === 'pending' ? 'Pending' : property.status}
                  </div>
                </div>

                {/* Property Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {property.street_address}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <MapPin size={12} />
                    <span className="truncate">
                      {property.city}, {property.state}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1 text-[#7CB342] font-bold text-sm">
                      <DollarSign size={14} />
                      {formatPrice(property.asking_price).replace('$', '')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {property.bedrooms}bd/{property.bathrooms}ba
                    </div>
                  </div>
                  
                  {/* Wholesaler Badge */}
                  {property.wholesaler?.name && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        {property.wholesaler.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Selected Overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-[#7CB342]/5 pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
