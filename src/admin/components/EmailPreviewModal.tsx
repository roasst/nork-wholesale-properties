import { X, Mail, Calendar } from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  body: string;
  date: string;
}

export const EmailPreviewModal = ({ isOpen, onClose, subject, body, date }: EmailPreviewModalProps) => {
  if (!isOpen) return null;

  const formattedDate = new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7CB342] flex items-center justify-center">
              <Mail className="text-white" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Original Email</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Calendar size={16} />
              <span>{formattedDate}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Subject</h3>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{subject}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Message</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {body}
              </pre>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
