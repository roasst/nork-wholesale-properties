import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { BRANDING } from '../config/branding';

export const Header = () => {
  return (
    <header className="bg-gray-900 text-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src={BRANDING.logoUrl}
              alt={BRANDING.companyName}
              className="h-10 md:h-12"
            />
            <span className="text-base md:text-2xl font-bold">{BRANDING.companyName}</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-medium hover:text-green-400 transition-colors"
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link
              to="/properties"
              className="px-4 py-2 rounded-md font-semibold text-sm transition-colors"
              style={{
                backgroundColor: BRANDING.accentColor,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = BRANDING.accentColorHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRANDING.accentColor}
            >
              Properties
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};
