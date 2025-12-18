import { Link } from 'react-router-dom';
import { Bed, Bath, Square } from 'lucide-react';
import { Property } from '../types';
import { formatCurrency, getStatusColor } from '../lib/utils';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const fullAddress = `${property.street_address}, ${property.city}, ${property.state} ${property.zip_code}`;

  return (
    <Link
      to={`/property/${property.id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative aspect-[4/3] bg-gray-200">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={fullAddress}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Square size={64} />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`${getStatusColor(property.status)} text-white text-xs font-bold px-3 py-1 rounded-full`}>
            {property.status}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className="bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded">
            {property.property_type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <p className="text-2xl md:text-3xl font-bold text-gray-900 break-words">{formatCurrency(property.asking_price)}</p>
          <p className="text-sm text-gray-600 mt-1">ARV: {formatCurrency(property.arv)}</p>
        </div>

        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          <span translate="no">{fullAddress}</span>
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Bed size={16} />
            <span>{property.bedrooms} bd</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath size={16} />
            <span>{property.bathrooms} ba</span>
          </div>
          <div className="flex items-center gap-1">
            <Square size={16} />
            <span>{property.square_footage.toLocaleString()} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
