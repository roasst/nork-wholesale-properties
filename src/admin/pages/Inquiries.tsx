import { useEffect, useState } from 'react';
import { Mail, Phone, Calendar, Trash2, Edit2, Check, X } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { Toast, ToastType } from '../components/Toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Inquiry } from '../types';

export const Inquiries = () => {
  const { user, canDeleteProperties } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, property:properties(street_address, city, state)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setToast({ message: 'Failed to load inquiries', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filter === 'read') return !!inquiry.marked_read_at;
    if (filter === 'unread') return !inquiry.marked_read_at;
    return true;
  });

  const toggleRead = async (inquiry: Inquiry) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          marked_read_at: inquiry.marked_read_at ? null : new Date().toISOString(),
          marked_read_by: inquiry.marked_read_at ? null : user?.id,
        })
        .eq('id', inquiry.id);

      if (error) throw error;

      setToast({
        message: inquiry.marked_read_at ? 'Marked as unread' : 'Marked as read',
        type: 'success',
      });
      fetchInquiries();
    } catch (error) {
      console.error('Error updating inquiry:', error);
      setToast({ message: 'Failed to update inquiry', type: 'error' });
    }
  };

  const startEditingNotes = (inquiry: Inquiry) => {
    setEditingNotesId(inquiry.id);
    setNotesValue(inquiry.notes || '');
  };

  const saveNotes = async (inquiryId: string) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ notes: notesValue || null })
        .eq('id', inquiryId);

      if (error) throw error;

      setToast({ message: 'Notes saved successfully', type: 'success' });
      setEditingNotesId(null);
      fetchInquiries();
    } catch (error) {
      console.error('Error saving notes:', error);
      setToast({ message: 'Failed to save notes', type: 'error' });
    }
  };

  const handleDeleteClick = (id: string) => {
    setInquiryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!inquiryToDelete) return;

    try {
      const { error } = await supabase
        .from('inquiries')
        .update({
          is_deleted: true,
          deleted_by: user?.id,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', inquiryToDelete);

      if (error) throw error;

      setToast({ message: 'Inquiry deleted successfully', type: 'success' });
      fetchInquiries();
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      setToast({ message: 'Failed to delete inquiry', type: 'error' });
    } finally {
      setShowDeleteModal(false);
      setInquiryToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#7CB342] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#7CB342] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-[#7CB342] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CB342] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inquiries...</p>
          </div>
        ) : filteredInquiries.length > 0 ? (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  !inquiry.marked_read_at ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === inquiry.id ? null : inquiry.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{inquiry.name}</h3>
                        {!inquiry.marked_read_at && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            Unread
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {inquiry.email}
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            {inquiry.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(inquiry.created_at).toLocaleString()}
                        </div>
                      </div>
                      {inquiry.property && (
                        <p className="text-sm text-gray-700 mt-2 font-medium">
                          Property: {inquiry.property.street_address}, {inquiry.property.city},{' '}
                          {inquiry.property.state}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRead(inquiry);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title={inquiry.marked_read_at ? 'Mark as unread' : 'Mark as read'}
                      >
                        {inquiry.marked_read_at ? <X size={18} /> : <Check size={18} />}
                      </button>
                      {canDeleteProperties && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(inquiry.id);
                          }}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {expandedId === inquiry.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {inquiry.message && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Message:</h4>
                        <p className="text-gray-900 whitespace-pre-wrap">{inquiry.message}</p>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Notes:</h4>
                        {editingNotesId !== inquiry.id && (
                          <button
                            onClick={() => startEditingNotes(inquiry)}
                            className="flex items-center gap-1 text-sm text-[#7CB342] hover:text-[#689F38]"
                          >
                            <Edit2 size={14} />
                            {inquiry.notes ? 'Edit' : 'Add Note'}
                          </button>
                        )}
                      </div>

                      {editingNotesId === inquiry.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={notesValue}
                            onChange={(e) => setNotesValue(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
                            placeholder="Add your notes here..."
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => saveNotes(inquiry.id)}
                              className="px-4 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-lg font-medium transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900 whitespace-pre-wrap">
                          {inquiry.notes || 'No notes yet'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Mail size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No inquiries found</h3>
            <p className="text-gray-600">
              {filter !== 'all'
                ? `No ${filter} inquiries at the moment`
                : 'Inquiries from your website will appear here'}
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
        confirmText="Delete"
        confirmStyle="danger"
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
};
