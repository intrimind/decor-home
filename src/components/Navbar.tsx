import React, { useState } from 'react';
import { MessageCircle, Menu, X, Phone } from 'lucide-react';
import { StoreSettings } from '../types';

interface NavbarProps {
  settings: StoreSettings;
  onOpenAdmin?: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenAdmin,
  onNavigateSection,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cleanWhatsappNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const generalWhatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    settings.whatsappPreFilledMessage || 'Bonjour Décor Home, je souhaite des renseignements sur vos collections.'
  )}`;

  const handleNavClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D8] transition-colors">
      {/* Editorial Announcement Banner */}
      <div className="bg-[#1C1917] text-[#FAF8F5] text-[11px] sm:text-xs py-1.5 px-4 tracking-wider text-center flex items-center justify-between">
        <span className="hidden sm:inline-block opacity-75">Boutique & Showroom d'Intérieur</span>
        <span className="mx-auto font-medium">Showroom ouvert du lundi au samedi · Visite privée & conseils sur rendez-vous</span>
        <div className="hidden sm:flex items-center gap-3 opacity-80">
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:opacity-100 transition-opacity"
          >
            Instagram
          </a>
          <span>·</span>
          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:opacity-100 transition-opacity"
          >
            TikTok
          </a>
        </div>
      </div>

      {/* Top Bar Contract: 3-Zone Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => handleNavClick('accueil')}
            className="text-left group cursor-pointer"
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-widest text-[#1C1917] font-semibold uppercase group-hover:text-[#9C5432] transition-colors whitespace-nowrap shrink-0">
              DÉCOR HOME
            </span>
          </button>

          {/* Zone 2: 4-5 clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs lg:text-sm font-medium tracking-wide uppercase text-[#57534E]">
            <button
              onClick={() => handleNavClick('catalogue')}
              className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Collections
            </button>
            <button
              onClick={() => handleNavClick('lookbook')}
              className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Lookbook & Inspirations
            </button>
            <button
              onClick={() => handleNavClick('showroom')}
              className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Notre Showroom
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="hover:text-[#1C1917] transition-colors whitespace-nowrap shrink-0 cursor-pointer py-1"
            >
              Contact & Accès
            </button>
          </nav>

          {/* Zone 3: 1 primary action button + discreet controls */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href={generalWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium uppercase tracking-wider text-white bg-[#1C1917] hover:bg-[#9C5432] rounded-md transition-colors whitespace-nowrap shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span className="hidden sm:inline">Discuter sur WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#1C1917] hover:bg-[#EFECE6] rounded-md cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] border-b border-[#E8E2D8] px-6 py-6 space-y-5 animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-4 text-sm font-medium tracking-wider uppercase text-[#1C1917]">
            <button
              onClick={() => handleNavClick('accueil')}
              className="text-left py-1 hover:text-[#9C5432] transition-colors"
            >
              Accueil
            </button>
            <button
              onClick={() => handleNavClick('catalogue')}
              className="text-left py-1 hover:text-[#9C5432] transition-colors"
            >
              Collections & Pièces Déco
            </button>
            <button
              onClick={() => handleNavClick('lookbook')}
              className="text-left py-1 hover:text-[#9C5432] transition-colors"
            >
              Lookbook & Mises en Scène
            </button>
            <button
              onClick={() => handleNavClick('showroom')}
              className="text-left py-1 hover:text-[#9C5432] transition-colors"
            >
              Le Showroom & Horaires
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-left py-1 hover:text-[#9C5432] transition-colors"
            >
              Contact Direct
            </button>
          </nav>

          <div className="pt-4 border-t border-[#E8E2D8] space-y-3">
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-3 text-xs text-[#57534E] hover:text-[#1C1917]"
            >
              <Phone className="w-4 h-4 text-[#9C5432]" />
              <span>{settings.phone}</span>
            </a>
            <div className="flex items-center gap-4 text-xs font-medium text-[#78716C] pt-1">
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1C1917]"
              >
                Instagram
              </a>
              <span>·</span>
              <a
                href={settings.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#1C1917]"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
