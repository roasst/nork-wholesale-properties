/**
 * Broadcast Page - WhatsApp Property Broadcast Center
 */

import { useState, useMemo, useCallback } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import {
  BroadcastFilters,
  BroadcastFilterValues,
  BroadcastPropertyGrid,
  BroadcastPreview,
  ShareButtons,
} from '../components/PropertyBroadcast';
import { useAdminProperties } from '../hooks/useAdminProperties';
import { useToast } from '../context/ToastContext';
import { formatBroadcastMessage } from '../utils/whatsappFormatter';
import { Property, PropertyType } from '../../types';

export const Broadcast = () => {
  const { success } = useToast();
  
  // Load all active properties
  const { properties: allProperties, loading, refetch } = useAdminProperties({
    status: 'all',
    is_active: true,
  });

  // Filter state
  const [filters, setFilters] = useState<BroadcastFilterValues>({
    minPrice: null,
    maxPrice: null,
    city: '',
    county: '',
    propertyTypes: [],
    status: '',
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Preview modal state
  const [showPreview, setShowPreview] = useState(false);

  // Get unique cities and counties for filter dropdowns
  const availableCities = useMemo(() => {
    const cities = [...new Set(allProperties.map((p) => p.city))].filter(Boolean);
    return cities.sort();
  }, [allProperties]);

  const availableCounties = useMemo(() => {
    const counties = [...new Set(allProperties.map((p) => p.county))].filter(Boolean);
    return counties.sort();
  }, [allProperties]);

  // Apply filters to properties
  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      // Price filter
      if (filters.minPrice !== null && property.asking_price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && property.asking_price > filters.maxPrice) {
        return false;
      }

      // City filter
      if (filters.city && property.city !== filters.city) {
        return false;
      }

      // County filter
      if (filters.county && property.county !== filters.county) {
        return false;
      }

      // Property type filter
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.property_type as PropertyType)) {
        return false;
      }

      // Status filter
      if (filters.status && property.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [allProperties, filters]);

  // Get selected properties
  const selectedProperties = useMemo(() => {
    return filteredProperties.filter((p) => selectedIds.has(p.id));
  }, [filteredProperties, selectedIds]);

  // Selection handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredProperties.map((p) => p.id)));
  }, [filteredProperties]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Copy message to clipboard
  const handleCopyMessage = useCallback(async () => {
    if (selectedProperties.length === 0) return;
    
    const message = formatBroadcastMessage(selectedProperties);
    await navigator.clipboard.writeText(message);
    success('Message copied to clipboard!');
  }, [selectedProperties, success]);

  // Open preview modal
  const handlePreview = useCallback(() => {
    if (selectedProperties.length === 0) return;
    setShowPreview(true);
  }, [selectedProperties]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <MessageCircle className="text-[#25D366]" size={28} />
              WhatsApp Broadcast
            </h1>
            <p className="text-gray-500 mt-1">
              Select properties and share them to WhatsApp contacts, groups, or channels
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <BroadcastFilters
          filters={filters}
          onChange={setFilters}
          availableCities={availableCities}
          availableCounties={availableCounties}
          totalCount={allProperties.length}
          filteredCount={filteredProperties.length}
        />

        {/* Share Buttons */}
        <ShareButtons
          selectedCount={selectedIds.size}
          onPreview={handlePreview}
          onCopyMessage={handleCopyMessage}
          disabled={loading}
        />

        {/* Property Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#7CB342] border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-500">Loading properties...</p>
          </div>
        ) : (
          <BroadcastPropertyGrid
            properties={filteredProperties}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        )}

        {/* Preview Modal */}
        <BroadcastPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          properties={selectedProperties}
        />
      </div>
    </AdminLayout>
  );
};
