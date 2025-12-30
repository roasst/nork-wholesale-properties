import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, MessageSquare, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { canManageUsers } = useAuth();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/properties', icon: Home, label: 'Properties' },
    { path: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries' },
    ...(canManageUsers ? [{ path: '/admin/users', icon: Users, label: 'Users' }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <span className="font-semibold text-gray-900">Menu</span>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    active
                      ? 'bg-[#7CB342] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
