import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  ExternalLink, 
  Maximize2, 
  Ruler, 
  Layers, 
  Tag, 
  Video,
  Copy,
  Check
} from 'lucide-react';
import { Product, StoreSettings } from '../types';

interface ProductModalProps {
  product: Product | null;
  allProducts: Product[];
  settings: StoreSettings;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  allProducts,
  settings,
  onClose,
  onSelectProduct,
}) => {
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['/src/assets/images/hero_decor_home_salon_1793732697943.jpg'];

  const cleanWhatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappPreFilledText = `Bonjour Décor Home, je souhaite des informations et connaître la disponibilité pour le produit : "${product.title}" (Réf: ${product.reference}, Tarif: ${new Intl.NumberFormat('fr-FR').format(product.price)} DZD). Est-il visible au showroom ?`;
  const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(whatsappPreFilledText)}`;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' DZD';
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin + `#produit-${product.reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Find 3 complementary / related products
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category === product.category || p.badge === 'coup-de-coeur'))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="relative bg-[#FAF8F5] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-[#E8E2D8] max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#78716C]">
            <span className="font-semibold text-[#1C1917]">Catalogue Décor Home</span>
            <span>·</span>
            <span>Réf. {product.reference}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFECE6] rounded-md transition-colors cursor-pointer"
              title="Copier le lien de la fiche"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-medium">Lien copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Partager</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFECE6] rounded-md transition-colors cursor-pointer"
              aria-label="Fermer la fiche produit"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 lg:p-8 space-y-10">
          
          {/* Main 2-Column Split: Gallery (Left) & Contiguous Sheet (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Multi-Angle Gallery */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F5F2EB] border border-[#E8E2D8] shadow-sm">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={`${product.title} - vue ${activeImageIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-all duration-500"
                />

                {/* Badge Overlay */}
                {product.badge && product.badge !== 'aucun' && (
                  <div className="absolute top-4 left-4">
                    <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded bg-[#1C1917] text-white shadow-sm">
                      {product.badge === 'coup-de-coeur' ? 'Coup de Cœur' : product.badge === 'nouveaute' ? 'Nouveauté' : 'Exclusivité'}
                    </span>
                  </div>
                )}
              </div>

              {/* Multi-angle Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        activeImageIndex === idx ? 'border-[#9C5432] shadow-sm' : 'border-[#E8E2D8] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Vignette ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Contiguous Purchase / Information Module */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Category & Title */}
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-[#9C5432] font-semibold">
                  {product.category.replace('-', ' ')}
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-normal leading-snug">
                  {product.title}
                </h2>
              </div>

              {/* Price & Stock Indicator */}
              <div className="p-4 bg-white rounded-xl border border-[#E8E2D8] flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#78716C] block">Tarif Showroom</span>
                  <span className="text-2xl font-bold font-mono text-[#1C1917] tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <div>
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>En stock au showroom</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Disponible sous 48h</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]">
                  L'Histoire de la Pièce
                </h4>
                <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Technical Specifications */}
              <div className="border-t border-b border-[#E8E2D8] py-4 space-y-3">
                <div className="flex items-start gap-3 text-xs">
                  <Ruler className="w-4 h-4 text-[#9C5432] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1C1917]">Dimensions : </span>
                    <span className="text-[#57534E]">{product.dimensions}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <Layers className="w-4 h-4 text-[#9C5432] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1C1917]">Matières & Finitions : </span>
                    <span className="text-[#57534E]">{product.material}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-xs">
                  <Tag className="w-4 h-4 text-[#9C5432] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#1C1917]">Référence Unique : </span>
                    <span className="font-mono text-[#57534E]">{product.reference}</span>
                  </div>
                </div>
              </div>

              {/* Primary Action Button: WhatsApp Pre-filled */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-medium text-sm uppercase tracking-wider rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Demander des infos sur WhatsApp</span>
                </a>
                <p className="text-[11px] text-[#78716C] text-center">
                  Ouvre WhatsApp avec la référence pré-remplie · Réponse rapide de nos décorateurs
                </p>
              </div>

              {/* Social Media Video Links (Reel / TikTok) */}
              {(product.instagramReelUrl || product.tiktokVideoUrl) && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {product.instagramReelUrl && (
                    <a
                      href={product.instagramReelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#1C1917] bg-white px-3 py-1.5 rounded-md border border-[#E8E2D8] hover:border-[#1C1917] transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-[#E1306C]" />
                      <span>Voir en vidéo sur Instagram Reel</span>
                    </a>
                  )}

                  {product.tiktokVideoUrl && (
                    <a
                      href={product.tiktokVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#1C1917] bg-white px-3 py-1.5 rounded-md border border-[#E8E2D8] hover:border-[#1C1917] transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-[#1C1917]" />
                      <span>Découvrir sur TikTok</span>
                    </a>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Related / Complementary Look Section */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-[#E8E2D8] space-y-4">
              <h3 className="font-serif text-xl text-[#1C1917]">
                Pour Compléter ce Look
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectProduct(rel);
                      setActiveImageIndex(0);
                    }}
                    className="p-3 bg-white rounded-lg border border-[#E8E2D8] hover:border-[#9C5432] transition-colors cursor-pointer flex items-center gap-3 group"
                  >
                    <img
                      src={rel.images?.[0]}
                      alt={rel.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 object-cover rounded-md bg-[#F5F2EB]"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-[#1C1917] group-hover:text-[#9C5432] transition-colors truncate">
                        {rel.title}
                      </p>
                      <p className="text-[11px] font-mono text-[#78716C] mt-0.5">
                        {formatPrice(rel.price)}
                      </p>
                      <span className="text-[10px] text-[#9C5432] underline mt-0.5 block">
                        Voir la fiche →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
