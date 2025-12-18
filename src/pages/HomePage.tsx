import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Clock, Shield } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyCardSkeleton } from '../components/PropertyCardSkeleton';
import { BRANDING } from '../config/branding';

export const HomePage = () => {
  const { properties, loading } = useProperties(undefined, 6);

  return (
    <div>
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Off-Market Deals.
              <br />
              <span style={{ color: BRANDING.accentColor }}>Cash Buyers Only.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Exclusive wholesale properties for serious real estate investors.
              Deeply discounted deals that move fast.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-white font-bold text-lg px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-xl"
              style={{ backgroundColor: BRANDING.accentColor }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = BRANDING.accentColorHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BRANDING.accentColor}
            >
              View All Properties
              <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <TrendingUp className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Deep Discounts</h3>
              <p className="text-gray-600">Below-market prices with built-in equity from day one</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Clock className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Move Fast</h3>
              <p className="text-gray-600">Properties updated daily - deals close quickly</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Shield className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Vetted Deals</h3>
              <p className="text-gray-600">Every property analyzed for maximum investment potential</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Featured Properties</h2>
            <p className="text-lg text-gray-600">Recent deals available for cash buyers</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg px-8 py-4 rounded-lg transition-colors"
                >
                  View All Properties
                  <ArrowRight size={20} />
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No properties available at the moment. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
