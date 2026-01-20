import { useState, useEffect, useRef } from 'react';
import { Search, Plus, ChevronDown, X, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Wholesaler } from '../../types';
import { AddWholesalerModal } from './AddWholesalerModal';

interface WholesalerSelectorProps {
  value: string | null;
  onChange: (wholesalerId: string | null) => void;
}

export const WholesalerSelector = ({ value, onChange }: WholesalerSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [selectedWholesaler, setSelectedWholesaler] = useState<Wholesaler | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWholesalers();
  }, []);

  useEffect(() => {
    if (value && !selectedWholesaler) {
      fetchSelectedWholesaler();
    } else if (!value) {
      setSelectedWholesaler(null);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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

  const fetchSelectedWholesaler = async () => {
    if (!value) return;

    try {
      const { data, error } = await supabase
        .from('wholesalers')
        .select('*')
        .eq('id', value)
        .maybeSingle();

      if (error) throw error;
      setSelectedWholesaler(data);
    } catch (err) {
      console.error('Failed to fetch selected wholesaler:', err);
    }
  };

  const filteredWholesalers = wholesalers.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.company_name && w.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (wholesaler: Wholesaler) => {
    setSelectedWholesaler(wholesaler);
    onChange(wholesaler.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedWholesaler(null);
    onChange(null);
  };

  const handleAddSuccess = () => {
    fetchWholesalers();
    setShowAddModal(false);
  };

  const handleOpenDropdown = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Wholesaler
      </label>

      {selectedWholesaler ? (
        <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-[#7CB342] rounded-lg">
          <div className="w-10 h-10 rounded-full bg-[#7CB342] flex items-center justify-center text-white font-bold flex-shrink-0">
            {selectedWholesaler.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{selectedWholesaler.name}</p>
            <p className="text-xs text-gray-600 truncate">{selectedWholesaler.email}</p>
            {selectedWholesaler.company_name && (
              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                <Building2 size={10} />
                {selectedWholesaler.company_name}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpenDropdown}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-[#7CB342] focus:border-transparent transition-colors"
        >
          <span className="text-gray-500">Select a wholesaler...</span>
          <ChevronDown size={18} className="text-gray-400" />
        </button>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
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

          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredWholesalers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No wholesalers found' : 'No wholesalers yet'}
              </div>
            ) : (
              filteredWholesalers.map((wholesaler) => (
                <button
                  key={wholesaler.id}
                  type="button"
                  onClick={() => handleSelect(wholesaler)}
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

          <div className="p-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
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

      <AddWholesalerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};
