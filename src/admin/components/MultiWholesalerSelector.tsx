import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Building2, Star, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Wholesaler } from '../../types';
import { AddWholesalerModal } from './AddWholesalerModal';

interface MultiWholesalerSelectorProps {
  primaryWholesalerId: string | null;
  additionalWholesalerIds: string[];
  onPrimaryChange: (wholesalerId: string | null) => void;
  onAdditionalChange: (wholesalerIds: string[]) => void;
}

export const MultiWholesalerSelector = ({
  primaryWholesalerId,
  additionalWholesalerIds,
  onPrimaryChange,
  onAdditionalChange,
}: MultiWholesalerSelectorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [selectedWholesalers, setSelectedWholesalers] = useState<Wholesaler[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all wholesalers on mount
  useEffect(() => {
    fetchWholesalers();
  }, []);

  // Fetch selected wholesalers when IDs change
  useEffect(() => {
    const allIds = [primaryWholesalerId, ...additionalWholesalerIds].filter(Boolean) as string[];
    if (allIds.length > 0) {
      fetchSelectedWholesalers(allIds);
    } else {
      setSelectedWholesalers([]);
    }
  }, [primaryWholesalerId, additionalWholesalerIds]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchWholesalers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wholesalers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setWholesalers(data || []);
    } catch (err) {
      console.error('Failed to fetch wholesalers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedWholesalers = async (ids: string[]) => {
    try {
      const { data, error } = await supabase
        .from('wholesalers')
        .select('*')
        .in('id', ids);

      if (error) throw error;
      
      // Sort to keep primary first
      const sorted = (data || []).sort((a, b) => {
        if (a.id === primaryWholesalerId) return -1;
        if (b.id === primaryWholesalerId) return 1;
        return 0;
      });
      
      setSelectedWholesalers(sorted);
    } catch (err) {
      console.error('Failed to fetch selected wholesalers:', err);
    }
  };

  const filteredWholesalers = wholesalers.filter(w => {
    // Exclude already selected wholesalers
    const isSelected = w.id === primaryWholesalerId || additionalWholesalerIds.includes(w.id);
    if (isSelected) return false;

    // Filter by search term
    const matchesSearch = 
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.company_name && w.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleSelectWholesaler = (wholesaler: Wholesaler) => {
    if (!primaryWholesalerId) {
      // First wholesaler becomes primary
      onPrimaryChange(wholesaler.id);
    } else {
      // Additional wholesalers
      onAdditionalChange([...additionalWholesalerIds, wholesaler.id]);
    }
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleRemoveWholesaler = (wholesalerId: string) => {
    if (wholesalerId === primaryWholesalerId) {
      // Removing primary - promote first additional or clear
      if (additionalWholesalerIds.length > 0) {
        const [newPrimary, ...remaining] = additionalWholesalerIds;
        onPrimaryChange(newPrimary);
        onAdditionalChange(remaining);
      } else {
        onPrimaryChange(null);
      }
    } else {
      // Remove from additional
      onAdditionalChange(additionalWholesalerIds.filter(id => id !== wholesalerId));
    }
  };

  const handleMakePrimary = (wholesalerId: string) => {
    if (wholesalerId === primaryWholesalerId) return;
    
    // Swap: current primary becomes additional, selected becomes primary
    const newAdditional = additionalWholesalerIds.filter(id => id !== wholesalerId);
    if (primaryWholesalerId) {
      newAdditional.unshift(primaryWholesalerId);
    }
    
    onPrimaryChange(wholesalerId);
    onAdditionalChange(newAdditional);
  };

  const handleAddSuccess = () => {
    fetchWholesalers();
    setShowAddModal(false);
  };

  const handleOpenDropdown = () => {
    setIsDropdownOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const totalSelected = selectedWholesalers.length;

  return (
    <div className="space-y-3" ref={dropdownRef}>
      {/* Selected Wholesalers List */}
      {selectedWholesalers.length > 0 && (
        <div className="space-y-2">
          {selectedWholesalers.map((wholesaler, index) => {
            const isPrimary = wholesaler.id === primaryWholesalerId;
            
            return (
              <div
                key={wholesaler.id}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                  isPrimary 
                    ? 'bg-green-50 border-[#7CB342]' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                  isPrimary ? 'bg-[#7CB342]' : 'bg-gray-400'
                }`}>
                  {wholesaler.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {wholesaler.name}
                    </p>
                    {isPrimary && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#7CB342] text-white text-xs font-medium rounded-full">
                        <Star size={10} fill="currentColor" />
                        Primary
                      </span>
                    )}
                    {wholesaler.is_trusted && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Trusted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{wholesaler.email}</p>
                  {wholesaler.company_name && (
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                      <Building2 size={10} />
                      {wholesaler.company_name}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleMakePrimary(wholesaler.id)}
                      className="p-1.5 text-gray-400 hover:text-[#7CB342] hover:bg-green-50 rounded transition-colors"
                      title="Make Primary"
                    >
                      <Star size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveWholesaler(wholesaler.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Wholesaler Button / Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={handleOpenDropdown}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 hover:border-[#7CB342] focus:ring-2 focus:ring-[#7CB342] focus:border-transparent transition-colors text-gray-600 hover:text-[#7CB342]"
        >
          <Plus size={18} />
          <span className="font-medium">
            {totalSelected === 0 ? 'Add Wholesaler' : 'Add Another Wholesaler'}
          </span>
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search wholesalers..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Wholesaler List */}
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : filteredWholesalers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No wholesalers found' : 'All wholesalers already added'}
                </div>
              ) : (
                filteredWholesalers.map((wholesaler) => (
                  <button
                    key={wholesaler.id}
                    type="button"
                    onClick={() => handleSelectWholesaler(wholesaler)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#7CB342] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {wholesaler.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{wholesaler.name}</p>
                      <p className="text-xs text-gray-500 truncate">{wholesaler.email}</p>
                    </div>
                    {wholesaler.is_trusted && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                        Trusted
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Create New */}
            <div className="p-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setShowAddModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-2 text-[#7CB342] hover:bg-green-50 rounded-lg font-medium transition-colors"
              >
                <Plus size={18} />
                Create New Wholesaler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <Users size={12} />
        {totalSelected === 0 
          ? 'Add one or more wholesalers to this property.' 
          : `${totalSelected} wholesaler${totalSelected > 1 ? 's' : ''} added. First one is marked as primary contact.`
        }
      </p>

      {/* Add Wholesaler Modal */}
      <AddWholesalerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};
