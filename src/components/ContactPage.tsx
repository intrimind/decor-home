import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  MessageCircle, 
  Instagram, 
  Clock, 
  Navigation, 
  Copy, 
  Check, 
  Sparkles,
  ExternalLink,
  Car
} from 'lucide-react';
import { StoreSettings } from '../types';

interface ContactPageProps {
  settings: StoreSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const [copied, setCopied] = useState(false);

  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const generalWhatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Bonjour Décor Home Béjaïa, je souhaite des renseignements sur vos collections ou préparer ma visite au showroom.'
  )}`;

  const handleCopyAddress = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${settings.address}, ${settings.city}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Google Maps interactive embed URL using exact coordinates 36.748502, 5.0489926 (Plus Code: P2XX+CJ9, Béjaïa)
  const googleMapsEmbedUrl = 'https://maps.google.com/maps?q=36.748502,5.0489926&hl=fr&z=17&output=embed';

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#FAF8F5] scroll-mt-20 border-t border-[#E8E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Editorial Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9C5432] font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Showroom & Contact</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1917] font-normal tracking-tight">
            Venir au Showroom & Nous Contacter
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
            Notre showroom Décor Home à Béjaïa vous accueille pour vous faire vivre chaque texture, matière et luminaire en situation réelle.
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
                10h – 19h30
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

        {/* Full-width Showroom Location & Direct Google Maps Embed */}
        <div className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-sm">
          
          {/* Top Bar with Address & Actions */}
          <div className="p-6 sm:p-8 border-b border-[#E8E2D8] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#FAF8F5]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#9C5432]" />
                <h3 className="font-serif text-2xl text-[#1C1917] font-semibold">
                  Localisation du Magasin
                </h3>
              </div>
              <p className="text-sm font-medium text-[#1C1917]">
                {settings.address}, {settings.city}
              </p>
              <p className="text-xs text-[#78716C] font-mono">
                Plus Code : P2XX+CJ9, Béjaïa (36.748502, 5.048993)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyAddress}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs text-[#57534E] hover:text-[#1C1917] bg-white rounded-lg border border-[#E8E2D8] transition-colors cursor-pointer shadow-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Adresse copiée</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copier l'adresse</span>
                  </>
                )}
              </button>

              <a
                href={settings.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
              >
                <Navigation className="w-4 h-4 text-[#C87D55]" />
                <span>Ouvrir dans Google Maps</span>
              </a>
            </div>
          </div>

          {/* Interactive Google Maps Iframe Directly in Page */}
          <div className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] bg-[#EFECE6]">
            <iframe
              title="Carte Google Maps Décor Home Béjaïa"
              src={googleMapsEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Bottom Info Strip: Horaires & Accès */}
          <div className="p-6 sm:p-8 bg-white grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-t border-[#E8E2D8]">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#9C5432] shrink-0 border border-[#E8E2D8]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1C1917] uppercase tracking-wider">
                  Horaires en Semaine
                </h4>
                <p className="text-[#57534E] mt-1 font-mono">
                  {settings.hoursWeekday}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#9C5432] shrink-0 border border-[#E8E2D8]">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1C1917] uppercase tracking-wider">
                  Weekend & Vendredi
                </h4>
                <p className="text-[#57534E] mt-1 font-mono">
                  {settings.hoursWeekend}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#FAF8F5] text-[#9C5432] shrink-0 border border-[#E8E2D8]">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1C1917] uppercase tracking-wider">
                  Accès & Stationnement
                </h4>
                <p className="text-[#57534E] mt-1">
                  Cité Djama Bâtiment D, Béjaïa · Stationnement aisé devant le showroom.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
