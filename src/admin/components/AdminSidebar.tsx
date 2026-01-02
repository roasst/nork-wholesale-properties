import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home, MessageSquare, Users, X, Building2, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePendingCount } from '../hooks/usePendingCount';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { canManageUsers, isOwner } = useAuth();
  const pendingCount = usePendingCount();

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/properties', icon: Home, label: 'Properties', badge: pendingCount },
    { path: '/admin/inquiries', icon: MessageSquare, label: 'Inquiries' },
    { path: '/admin/wholesalers', icon: Building2, label: 'Wholesalers' },
    ...(canManageUsers ? [{ path: '/admin/users', icon: Users, label: 'Users' }] : []),
    ...(isOwner ? [{ path: '/admin/analytics', icon: TrendingUp, label: 'Analytics', ownerOnly: true }] : []),
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
                  <span className="flex-1">{item.label}</span>
                  {(item as any).ownerOnly && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      active ? 'bg-white text-[#7CB342]' : 'bg-purple-100 text-purple-700'
                    }`}>
                      Owner
                    </span>
                  )}
                  {item.badge != null && item.badge > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      active
                        ? 'bg-white text-[#7CB342]'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
