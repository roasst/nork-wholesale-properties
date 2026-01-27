/**
 * Broadcast Page - WhatsApp Property Broadcast Center
 * With collage and PDF generation + auto-download + WhatsApp flow
 */

import { useState, useMemo, useCallback } from 'react';
import { MessageCircle, RefreshCw, MapPin, Users } from 'lucide-react';
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
import { formatBroadcastMessage, generateWhatsAppUrl } from '../utils/whatsappFormatter';
import { generateCollage, downloadCollage } from '../utils/collageGenerator';
import { generatePDF } from '../utils/pdfGenerator';
import { PropertyType } from '../../types';

export const Broadcast = () => {
  const { success, error, info } = useToast();
  
  // Load all active properties
  const { properties: allProperties, loading, refetch } = useAdminProperties({
    status: 'all',
    is_active: true,
  });

  // Filter state - includes addressSearch and wholesalerSearch
  const [filters, setFilters] = useState<BroadcastFilterValues>({
    minPrice: null,
    maxPrice: null,
    city: '',
    county: '',
    propertyTypes: [],
    status: '',
    addressSearch: '',
    wholesalerSearch: '',
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
      // Price filters
      if (filters.minPrice !== null && property.asking_price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && property.asking_price > filters.maxPrice) {
        return false;
      }
      
      // Location filters
      if (filters.city && property.city !== filters.city) {
        return false;
      }
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
      
      // Address search filter (case-insensitive, partial match)
      if (filters.addressSearch) {
        const searchLower = filters.addressSearch.toLowerCase();
        const addressMatch = 
          property.street_address?.toLowerCase().includes(searchLower) ||
          property.city?.toLowerCase().includes(searchLower) ||
          property.zip_code?.toLowerCase().includes(searchLower);
        if (!addressMatch) {
          return false;
        }
      }
      
      // Wholesaler search filter (case-insensitive, partial match)
      if (filters.wholesalerSearch) {
        const searchLower = filters.wholesalerSearch.toLowerCase();
        const wholesaler = property.wholesalers;
        const wholesalerMatch = 
          wholesaler?.name?.toLowerCase().includes(searchLower) ||
          wholesaler?.company_name?.toLowerCase().includes(searchLower) ||
          wholesaler?.email?.toLowerCase().includes(searchLower);
        if (!wholesalerMatch) {
          return false;
        }
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

  // Download collage (2-4 properties)
  const handleDownloadCollage = useCallback(async () => {
    if (selectedProperties.length < 2 || selectedProperties.length > 4) {
      error('Collage requires 2-4 properties');
      return;
    }
    
    try {
      const dataUrl = await generateCollage(selectedProperties, {
        showPrices: true,
        showAddress: true,
      });
      downloadCollage(dataUrl);
      success('Collage downloaded! Attach it to your WhatsApp message.');
    } catch (err) {
      console.error('Collage generation failed:', err);
      error('Failed to generate collage. Some images may not be accessible.');
    }
  }, [selectedProperties, success, error]);

  // Download PDF (any number)
  const handleDownloadPDF = useCallback(async () => {
    if (selectedProperties.length === 0) {
      error('Select at least one property');
      return;
    }
    
    try {
      await generatePDF(selectedProperties, {
        title: `${selectedProperties.length} Investment ${selectedProperties.length === 1 ? 'Opportunity' : 'Opportunities'}`,
        includeImages: true,
      });
      success('PDF downloaded! Share it with your contacts.');
    } catch (err) {
      console.error('PDF generation failed:', err);
      error('Failed to generate PDF. Please try again.');
    }
  }, [selectedProperties, success, error]);

  // NEW: Auto-download media + open WhatsApp
  const handleShareWhatsApp = useCallback(async () => {
    if (selectedProperties.length === 0) {
      error('Select at least one property');
      return;
    }

    const count = selectedProperties.length;
    const useCollage = count >= 2 && count <= 4;

    try {
      // Step 1: Generate and download the media
      if (useCollage) {
        info('Creating collage...');
        const dataUrl = await generateCollage(selectedProperties, {
          showPrices: true,
          showAddress: true,
        });
        downloadCollage(dataUrl);
      } else {
        info('Creating PDF flyer...');
        await generatePDF(selectedProperties, {
          title: `${count} Investment ${count === 1 ? 'Opportunity' : 'Opportunities'}`,
          includeImages: true,
        });
      }

      // Step 2: Small delay to ensure download starts
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Generate message and open WhatsApp
      const message = formatBroadcastMessage(selectedProperties);
      const whatsappUrl = generateWhatsAppUrl(message);
      
      // Show instruction toast
      success(
        useCollage 
          ? 'Collage downloaded! Attach it in WhatsApp.' 
          : 'PDF downloaded! Attach it in WhatsApp.'
      );

      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

    } catch (err) {
      console.error('Share to WhatsApp failed:', err);
      error('Failed to prepare media. Please try the Download button instead.');
    }
  }, [selectedProperties, success, error, info]);

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
              Select properties and share them via WhatsApp with collage or PDF
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

        {/* Search Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Quick Search</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Address Search */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
              <input
                type="text"
                placeholder="Search address, city, or ZIP..."
                value={filters.addressSearch}
                onChange={(e) => setFilters({ ...filters, addressSearch: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-white"
              />
            </div>
            {/* Wholesaler Search */}
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
              <input
                type="text"
                placeholder="Search wholesaler name or company..."
                value={filters.wholesalerSearch}
                onChange={(e) => setFilters({ ...filters, wholesalerSearch: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <ShareButtons
          selectedCount={selectedIds.size}
          onPreview={handlePreview}
          onCopyMessage={handleCopyMessage}
          onDownloadCollage={handleDownloadCollage}
          onDownloadPDF={handleDownloadPDF}
          onShareWhatsApp={handleShareWhatsApp}
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
