import React from 'react';
import { 
  Phone, 
  MessageCircle, 
  Instagram, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { StoreSettings } from '../types';

interface ContactPageProps {
  settings: StoreSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const generalWhatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Bonjour Décor Home Béjaïa, je souhaite des renseignements sur vos collections ou préparer ma visite au showroom.'
  )}`;

  return (
    <section id="contact" className="py-16 sm:py-20 bg-[#FAF8F5] scroll-mt-20 border-t border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9C5432] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Réseaux & Contact Direct</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] font-normal tracking-tight">
            Nous Contacter & Nous Suivre
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
            Échangez directement avec notre équipe ou suivez les derniers arrivages du showroom Décor Home à Béjaïa.
          </p>
        </div>

        {/* 4 Direct Contact & Social Channels Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* WhatsApp Direct */}
          <a
            href={generalWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#25D366] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                En ligne
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#1C1917] font-semibold group-hover:text-[#25D366] transition-colors">
                WhatsApp Direct
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                Discutez directement avec notre équipe pour des renseignements ou réserver une pièce.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#25D366] flex items-center gap-1 pt-1">
              <span>Échanger sur WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </a>

          {/* Phone Call */}
          <a
            href={`tel:${settings.phone}`}
            className="p-6 bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#9C5432] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#9C5432]/10 text-[#9C5432] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E2D8]">
                Ligne directe
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#1C1917] font-semibold group-hover:text-[#9C5432] transition-colors">
                Appel Téléphonique
              </h3>
              <p className="text-xs text-[#78716C] mt-1 font-mono">
                {settings.phone}
              </p>
            </div>
            <div className="text-xs font-semibold text-[#9C5432] flex items-center gap-1 pt-1">
              <span>Appeler le showroom</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </a>

          {/* Instagram */}
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#E1306C] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#E1306C]/10 text-[#E1306C] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E2D8]">
                Inspirations
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#1C1917] font-semibold group-hover:text-[#E1306C] transition-colors">
                Instagram Décor
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                Suivez nos nouveautés, décors en vidéo et contactez-nous en DM.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#E1306C] flex items-center gap-1 pt-1">
              <span>Voir le profil Instagram</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </a>

          {/* TikTok */}
          <a
            href={settings.tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 bg-white rounded-2xl border border-[#E8E2D8] hover:border-[#1C1917] hover:shadow-lg transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#1C1917]/10 text-[#1C1917] flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="font-bold text-sm tracking-tighter">TikTok</span>
              </div>
              <span className="text-[10px] font-semibold text-[#78716C] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E8E2D8]">
                Mises en scène
              </span>
            </div>
            <div>
              <h3 className="font-serif text-lg text-[#1C1917] font-semibold group-hover:text-[#1C1917] transition-colors">
                TikTok Showroom
              </h3>
              <p className="text-xs text-[#78716C] mt-1">
                Visites virtuelles, zooms matières et pièces en mouvement.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#1C1917] flex items-center gap-1 pt-1">
              <span>Découvrir sur TikTok</span>
              <ExternalLink className="w-3 h-3" />
            </div>
          </a>

        </div>

      </div>
    </section>
  );
};
