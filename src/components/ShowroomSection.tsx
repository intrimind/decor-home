import React from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  Instagram, 
  Navigation, 
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { StoreSettings } from '../types';

interface ShowroomSectionProps {
  settings: StoreSettings;
}

export const ShowroomSection: React.FC<ShowroomSectionProps> = ({ settings }) => {
  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const rdvWhatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    'Bonjour Décor Home, je souhaite réserver une visite privée au showroom pour découvrir vos collections et échanger sur mon projet.'
  )}`;

  return (
    <section id="showroom" className="py-20 bg-[#FAF8F5] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-[#9C5432] font-semibold">
            Boutique & Espace d'Inspiration
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
            Notre Showroom à Béjaïa
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
            Plus qu'un magasin, notre showroom est un sanctuaire d'inspiration où chaque matière peut être touchée, comparée et mise en scène sous une lumière naturelle soignée.
          </p>
        </div>

        {/* 2-Column Showroom Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Practical Info & Opening Hours (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm flex flex-col justify-between space-y-8">
            
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#9C5432]">
                  Informations Pratiques
                </span>
                <h3 className="font-serif text-2xl text-[#1C1917]">
                  Venir Nous Rencontrer
                </h3>
              </div>

              {/* Physical Address */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#FAF8F5] text-[#9C5432] shrink-0 border border-[#E8E2D8]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                    Adresse Showroom
                  </h4>
                  <p className="text-sm text-[#57534E] mt-1 font-medium">
                    {settings.address}
                  </p>
                  <p className="text-xs text-[#78716C]">
                    {settings.city}
                  </p>
                  <a
                    href={settings.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#9C5432] hover:underline font-medium mt-2"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Ouvrir l'itinéraire Google Maps</span>
                  </a>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#FAF8F5] text-[#9C5432] shrink-0 border border-[#E8E2D8]">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-2 flex-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                    Horaires d'Ouverture
                  </h4>
                  <div className="space-y-1.5 text-xs text-[#57534E]">
                    <div className="flex justify-between pb-1 border-b border-[#F5F2EB]">
                      <span className="font-medium">Lundi – Samedi</span>
                      <span className="font-mono text-[#1C1917]">10h00 – 19h30</span>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-[#F5F2EB]">
                      <span className="font-medium">Vendredi</span>
                      <span className="font-mono text-[#1C1917]">15h00 – 20h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-[#78716C]">Dimanche</span>
                      <span className="text-[#A8A29E]">Fermé (sur rendez-vous)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Private Appointment Card */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1917]">
                  <CalendarCheck className="w-4 h-4 text-[#9C5432]" />
                  <span>Visites Privées & Conseil Déco</span>
                </div>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Vous avez un projet de villa ou d'appartement ? Nos architectes d'intérieur vous reçoivent en tête-à-tête pour vous orienter dans vos sélections.
                </p>
                <a
                  href={rdvWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs font-medium text-[#9C5432] hover:underline pt-1"
                >
                  Prendre rendez-vous sur WhatsApp →
                </a>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="pt-4 border-t border-[#E8E2D8] grid grid-cols-2 gap-3">
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E2D8] text-xs font-semibold text-[#1C1917] rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4 text-[#9C5432]" />
                <span>Appeler</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>

          </div>

          {/* Right Column: Stylized Showroom Visual & Interactive Map (7 cols) */}
          <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
            
            {/* Showroom Atmosphere Banner */}
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] shadow-md border border-[#E8E2D8] group">
              <img
                src="/src/assets/images/hero_decor_home_salon_1793732697943.jpg"
                alt="Showroom Décor Home Béjaïa"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-6 sm:p-8 flex flex-col justify-end text-white">
                <span className="text-xs uppercase tracking-widest text-[#EAD8C3] font-semibold">
                  Espace Matières & Lumières
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium mt-1">
                  {settings.address}, {settings.city}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-lg">
                  Un espace pensé pour vous faire vivre chaque texture : du grain du travertin au velours ambré.
                </p>
              </div>
            </div>

            {/* Embedded Google Maps Container */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8E2D8] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#9C5432]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                    Plan d'Accès Showroom Béjaïa
                  </span>
                </div>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#9C5432] hover:underline flex items-center gap-1"
                >
                  <span>Agrandir Google Maps</span>
                  <Navigation className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Direct Interactive Google Map Iframe */}
              <div className="relative h-64 sm:h-72 rounded-xl overflow-hidden border border-[#D6CEBE] bg-[#E8E2D8]">
                <iframe
                  title="Carte Google Maps Décor Home Béjaïa"
                  src="https://maps.google.com/maps?q=36.748502,5.0489926&hl=fr&z=17&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Social Channels Strip */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-[#78716C]">
                <span>Suivez nos arrivages hebdomadaires :</span>
                <div className="flex items-center gap-4">
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[#1C1917] hover:text-[#E1306C] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram Béjaïa</span>
                  </a>
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-[#1C1917] hover:text-[#9C5432] transition-colors"
                  >
                    <span>TikTok @decorhome_dz</span>
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
