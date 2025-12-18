import { Phone, Mail, MapPin } from 'lucide-react';
import { CONTACT_INFO } from '../config/contact';
import { BRANDING } from '../config/branding';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3">Contact Us</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <a href={`tel:${CONTACT_INFO.phone}`} className="hover:text-green-400 transition-colors">
                  {CONTACT_INFO.phoneFormatted}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-green-400 transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Nationwide Coverage</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">About</h3>
            <p className="text-gray-300 text-sm">
              We specialize in off-market wholesale real estate deals for serious cash buyers and investors.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Connect</h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <div>
                <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
                  WhatsApp
                </a>
              </div>
              <div>
                <a href={CONTACT_INFO.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} {BRANDING.companyName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
