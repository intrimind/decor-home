import React from 'react';
import { MessageCircle, ArrowDown, Sparkles, Compass, ShieldCheck, Clock } from 'lucide-react';
import { StoreSettings } from '../types';

interface HeroProps {
  settings: StoreSettings;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExploreClick }) => {
  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Bonjour Décor Home, je découvre votre catalogue showroom et souhaite être conseillé pour un projet de décoration.'
  )}`;

  return (
    <section id="accueil" className="relative bg-[#FAF8F5] pt-4 pb-12 sm:pb-16 border-b border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Showcase */}
        <div className="relative rounded-2xl overflow-hidden bg-[#1C1917] text-[#FAF8F5] shadow-xl min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-end">
          
          {/* Background Image with Scrim */}
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/hero_decor_home_salon_1793732697943.jpg"
              alt="Salon showroom Décor Home"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.92] transition-transform duration-1000 scale-100 hover:scale-105"
            />
            {/* Measured contrast scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
          </div>

          {/* Foreground Hero Content */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-16 max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-widest uppercase text-[#EAD8C3] bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#EAD8C3]" />
              <span>Showroom & Inspirations Déco</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-[1.1] text-balance">
              L’Art de Sculpter l’Espace & la Lumière
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-[#F5F2EB]/90 font-light leading-relaxed max-w-2xl">
              Découvrez notre sélection exclusive de pièces d’ébénisterie, luminaires sculpturaux et céramiques d’artisanat d’art. Une collection pensée pour éveiller les sens et sublimer les intérieurs singuliers.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onExploreClick}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#FAF8F5] text-[#1C1917] hover:bg-[#EAE4D9] text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-md transition-colors shadow-lg cursor-pointer group"
              >
                <span>Explorer le Catalogue</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-md transition-colors shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Discuter sur WhatsApp</span>
              </a>
            </div>

            <div className="text-xs text-[#E7E2D8]/80 font-light pt-1">
              <span>* Pas de vente en ligne directe · Conseil, réservation & découverte exclusive au showroom</span>
            </div>
          </div>
        </div>

        {/* 4-Column Showcase Trust Strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#E8E2D8] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#9C5432] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#1C1917]">Matières Nobles</h4>
              <p className="text-xs text-[#78716C] mt-0.5">Travertin, laiton brossé, chêne & grès artisanal</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#E8E2D8] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#9C5432] shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#1C1917]">Conseil Personnalisé</h4>
              <p className="text-xs text-[#78716C] mt-0.5">Accompagnement dans vos choix d'agencement</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#E8E2D8] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#9C5432] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#1C1917]">Séries Limitées</h4>
              <p className="text-xs text-[#78716C] mt-0.5">Pièces uniques et fabrication en ateliers d'art</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#E8E2D8] flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#9C5432] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-[#1C1917]">Showroom Ouvert 6j/7</h4>
              <p className="text-xs text-[#78716C] mt-0.5">{settings.address}, {settings.city}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
