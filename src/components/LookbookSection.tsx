import React, { useState } from 'react';
import { Sparkles, Eye, ArrowRight, Tag } from 'lucide-react';
import { LookbookScene, Product } from '../types';
import { LOOKBOOK_SCENES } from '../data/initialProducts';

interface LookbookSectionProps {
  scenes?: LookbookScene[];
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const LookbookSection: React.FC<LookbookSectionProps> = ({
  scenes,
  products,
  onSelectProduct,
}) => {
  const allScenes = (scenes && scenes.length > 0) ? scenes : LOOKBOOK_SCENES;
  const [activeSceneId, setActiveSceneId] = useState<string>(allScenes[0]?.id || 'scene-salon-japandi');
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  const activeScene = allScenes.find((s) => s.id === activeSceneId) || allScenes[0] || LOOKBOOK_SCENES[0];

  // Resolve products featured in this scene
  const sceneProducts = (activeScene.productIds || [])
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' DZD';
  };

  return (
    <section id="lookbook" className="py-20 bg-[#F5F2EB] border-t border-b border-[#E8E2D8] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9C5432] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspirations & Mises en Scène</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
              Le Lookbook Décor Home
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
              Explorez nos ambiances signatures photographiées au showroom. Cliquez sur les pastilles interactives sur l'image pour découvrir chaque objet qui compose la scène.
            </p>
          </div>

          {/* Scene Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {allScenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => {
                  setActiveSceneId(scene.id);
                  setHoveredHotspotId(null);
                }}
                className={`px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  activeSceneId === scene.id
                    ? 'bg-[#1C1917] text-white shadow-sm'
                    : 'bg-white text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFECE6] border border-[#E8E2D8]'
                }`}
              >
                {scene.title.split('&')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Lookbook Scene Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Visual with Interactive Hotspots (Left 8 cols) */}
          <div className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-[#1C1917] shadow-xl border border-[#E8E2D8]">
            <div className="relative aspect-[4/3] w-full">
              <img
                src={activeScene.image}
                alt={activeScene.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {/* Interactive Hotspot Pins ("Shop the Look") */}
              {(activeScene.hotspots || []).map((hs) => {
                const targetProduct = products.find((p) => p.id === hs.productId);
                const isHovered = hoveredHotspotId === hs.id;

                return (
                  <div
                    key={hs.id}
                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                    onMouseEnter={() => setHoveredHotspotId(hs.id)}
                    onMouseLeave={() => setHoveredHotspotId(null)}
                  >
                    {/* Hotspot Pulsing Indicator */}
                    <button
                      onClick={() => {
                        if (targetProduct) onSelectProduct(targetProduct);
                      }}
                      className="relative w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-[#1C1917] shadow-lg flex items-center justify-center hover:scale-110 hover:bg-[#9C5432] hover:text-white transition-all cursor-pointer"
                      aria-label={hs.label}
                    >
                      <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-40" />
                      <Tag className="w-3.5 h-3.5" />
                    </button>

                    {/* Hover Floating Glass Card */}
                    {isHovered && targetProduct && (
                      <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 w-64 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-[#E8E2D8] text-left animate-in fade-in slide-in-from-bottom-2 duration-150 z-30">
                        <div className="flex items-center gap-3">
                          <img
                            src={targetProduct.images?.[0]}
                            alt={targetProduct.title}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 object-cover rounded-md bg-[#FAF8F5]"
                          />
                          <div className="overflow-hidden">
                            <span className="text-[10px] text-[#9C5432] font-semibold uppercase tracking-wider block">
                              Shop the Look
                            </span>
                            <h4 className="text-xs font-medium text-[#1C1917] truncate">
                              {targetProduct.title}
                            </h4>
                            <p className="text-xs font-bold font-mono text-[#1C1917] mt-0.5">
                              {formatPrice(targetProduct.price)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectProduct(targetProduct)}
                          className="mt-2.5 w-full py-1.5 bg-[#1C1917] hover:bg-[#9C5432] text-white text-[11px] font-medium uppercase tracking-wider rounded-md transition-colors text-center block cursor-pointer"
                        >
                          Découvrir la Fiche →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white">
                <span className="text-xs uppercase tracking-widest text-[#EAD8C3] font-medium block">
                  {activeScene.subtitle}
                </span>
                <h3 className="font-serif text-2xl font-normal mt-1">
                  {activeScene.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Items Composition List (Right 4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#E8E2D8] shadow-sm space-y-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9C5432] block">
                Objets de la Scène
              </span>
              <h3 className="font-serif text-xl text-[#1C1917] font-medium mt-1">
                Composition de la Pièce
              </h3>
              <p className="text-xs text-[#78716C] mt-2 leading-relaxed">
                {activeScene.description}
              </p>
            </div>

            {/* List of Products in this look */}
            <div className="space-y-3 pt-2">
              {sceneProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="p-3 rounded-xl border border-[#E8E2D8] hover:border-[#9C5432] hover:bg-[#FAF8F5] transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={p.images?.[0]}
                      alt={p.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg bg-[#FAF8F5] shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-[#1C1917] group-hover:text-[#9C5432] transition-colors truncate">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-[#78716C] font-mono mt-0.5">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#9C5432] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E8E2D8] text-[11px] text-[#78716C] text-center">
              Des pièces pensées pour s'harmoniser naturellement dans votre espace.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
