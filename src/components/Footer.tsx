import React from 'react';
import { MessageCircle, Instagram, Phone, ArrowUp } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
  onOpenAdmin?: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenAdmin,
  onNavigateSection,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#1C1917] text-[#FAF8F5] border-t border-[#292524] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Footer 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Manifesto (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-serif text-2xl sm:text-3xl tracking-widest uppercase font-semibold text-white">
              DÉCOR HOME
            </h3>
            <p className="text-xs uppercase tracking-widest text-[#C87D55] font-medium">
              L'Art de Vivre & Décoration d'Intérieur
            </p>
            <p className="text-xs sm:text-sm text-[#A8A29E] leading-relaxed max-w-sm">
              Showroom de mobilier d'exception, luminaires et céramiques d'art. Nous sélectionnons des pièces singulières conçues pour traverser les époques avec noblesse et authenticité.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D6CEBE] hover:text-white transition-colors"
              >
                Instagram
              </a>
              <span>·</span>
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D6CEBE] hover:text-white transition-colors"
              >
                TikTok
              </a>
              <span>·</span>
              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D6CEBE] hover:text-[#25D366] transition-colors"
              >
                WhatsApp Direct
              </a>
            </div>
          </div>

          {/* Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li>
                <button
                  onClick={() => onNavigateSection('accueil')}
                  className="hover:text-white transition-colors"
                >
                  Accueil & Inspirations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('catalogue')}
                  className="hover:text-white transition-colors"
                >
                  Catalogue des Pièces
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('lookbook')}
                  className="hover:text-white transition-colors"
                >
                  Le Lookbook Déco
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateSection('showroom')}
                  className="hover:text-white transition-colors"
                >
                  Le Showroom à Béjaïa
                </button>
              </li>
            </ul>
          </div>

          {/* Showroom Location & Contact (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white">
              Le Showroom
            </h4>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              {settings.address}<br />
              {settings.city}
            </p>
            <p className="text-xs text-[#A8A29E] pt-1">
              <span className="text-white font-medium">Horaires : </span>
              {settings.hoursWeekday}
            </p>

            <div className="pt-2">
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center gap-2 text-xs text-white hover:text-[#C87D55] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#C87D55]" />
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Exact Copyright */}
        <div className="pt-8 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <p className="text-[#A8A29E]">
            2026. Tous droits réservés: Intrimind, Béjaïa.
          </p>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-[#78716C] hover:text-white transition-colors cursor-pointer"
            title="Remonter en haut de page"
          >
            <span>Haut de page</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

