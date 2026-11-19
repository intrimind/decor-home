import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, Tag } from 'lucide-react';
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
  const allScenes = scenes !== undefined ? scenes : LOOKBOOK_SCENES;
  const [activeSceneId, setActiveSceneId] = useState<string>(allScenes[0]?.id || '');
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep activeSceneId valid when scenes load or change from Firestore
  useEffect(() => {
    if (allScenes.length > 0 && !allScenes.some((s) => s.id === activeSceneId)) {
      setActiveSceneId(allScenes[0].id);
      setHoveredHotspotId(null);
    }
  }, [allScenes, activeSceneId]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  if (allScenes.length === 0) {
    return null;
  }

  const activeScene = allScenes.find((s) => s.id === activeSceneId) || allScenes[0];

  // Resolve a product by ID, reference, or label
  const resolveProduct = (productId?: string, fallbackLabel?: string): Product | undefined => {
    if (productId) {
      const byId = products.find((p) => p.id === productId);
      if (byId) return byId;
      const byRef = products.find((p) => p.reference.toLowerCase() === productId.toLowerCase());
      if (byRef) return byRef;
    }
    if (fallbackLabel) {
      const norm = fallbackLabel.trim().toLowerCase();
      const byTitle = products.find(
        (p) => p.title.trim().toLowerCase() === norm || p.title.toLowerCase().includes(norm)
      );
      if (byTitle) return byTitle;
    }
    return undefined;
  };

  // Combine explicitly associated productIds AND all hotspot productIds (deduplicated)
  const combinedProductIds = Array.from(
    new Set([
      ...(activeScene.productIds || []),
      ...(activeScene.hotspots || []).map((h) => h.productId).filter(Boolean),
    ])
  );

  const sceneProducts = combinedProductIds
    .map((id) => {
      const matchingHotspot = (activeScene.hotspots || []).find((h) => h.productId === id);
      return resolveProduct(id, matchingHotspot?.label);
    })
    .filter((p): p is Product => Boolean(p));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' DZD';
  };

  const handleOpenHotspot = (id: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredHotspotId(id);
  };

  const handleScheduleCloseHotspot = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredHotspotId(null);
    }, 150);
  };

  const hoveredHotspot = (activeScene.hotspots || []).find((h) => h.id === hoveredHotspotId) || null;
  const hoveredProduct = hoveredHotspot
    ? resolveProduct(hoveredHotspot.productId, hoveredHotspot.label)
    : undefined;

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
              Explorez nos ambiances signatures photographiées au showroom. Survolez ou cliquez sur les pastilles interactives sur l'image pour découvrir chaque objet qui compose la scène.
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
                  activeScene.id === scene.id
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
            <div
              className="relative aspect-[4/3] w-full"
              onClick={() => {
                if (hoveredHotspotId) setHoveredHotspotId(null);
              }}
            >
              <img
                src={activeScene.image}
                alt={activeScene.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {/* Interactive Hotspot Pins ("Shop the Look") */}
              {(activeScene.hotspots || []).map((hs) => {
                const targetProduct = resolveProduct(hs.productId, hs.label);
                const isHovered = hoveredHotspotId === hs.id;

                return (
                  <div
                    key={hs.id}
                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                      isHovered ? 'z-40' : 'z-20'
                    }`}
                    onMouseEnter={() => handleOpenHotspot(hs.id)}
                    onMouseLeave={handleScheduleCloseHotspot}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Hotspot Pulsing Indicator */}
                    <button
                      type="button"
                      onClick={() => {
                        const supportsHover =
                          typeof window !== 'undefined' &&
                          window.matchMedia('(hover: hover)').matches;
                        if (supportsHover) {
                          if (targetProduct) {
                            onSelectProduct(targetProduct);
                          } else {
                            handleOpenHotspot(hs.id);
                          }
                        } else {
                          // Touch devices: first tap shows card, second tap opens modal
                          if (isHovered && targetProduct) {
                            onSelectProduct(targetProduct);
                          } else {
                            handleOpenHotspot(hs.id);
                          }
                        }
                      }}
                      className={`relative w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-all cursor-pointer ${
                        isHovered
                          ? 'scale-110 bg-[#9C5432] text-white'
                          : 'bg-white/95 backdrop-blur-md text-[#1C1917] hover:scale-110 hover:bg-[#9C5432] hover:text-white'
                      }`}
                      aria-label={hs.label}
                    >
                      <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-40 pointer-events-none" />
                      <Tag className="w-3.5 h-3.5 relative z-10" />
                    </button>
                  </div>
                );
              })}

              {/* Clamped Floating Glass Card: mathematically guaranteed to stay inside image borders */}
              {hoveredHotspot && (
                <div
                  style={{
                    left: 'clamp(8px, calc(' + hoveredHotspot.x + '% - 120px), calc(100% - 248px))',
                    ...(hoveredHotspot.y < 50
                      ? { top: `calc(${hoveredHotspot.y}% + 22px)` }
                      : { bottom: `calc(${100 - hoveredHotspot.y}% + 22px)` }),
                  }}
                  onMouseEnter={() => handleOpenHotspot(hoveredHotspot.id)}
                  onMouseLeave={handleScheduleCloseHotspot}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute w-[240px] max-w-[calc(100%-16px)] bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-[#E8E2D8] text-left z-50 transition-opacity duration-150"
                >
                  {hoveredProduct ? (
                    <>
                      <div className="flex items-center gap-3">
                        <img
                          src={hoveredProduct.images?.[0] || '/assets/images/hero_decor_home_salon_1793732697943.jpg'}
                          alt={hoveredProduct.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-md bg-[#FAF8F5] shrink-0"
                        />
                        <div className="overflow-hidden min-w-0">
                          <span className="text-[10px] text-[#9C5432] font-semibold uppercase tracking-wider block">
                            Shop the Look
                          </span>
                          <h4 className="text-xs font-medium text-[#1C1917] truncate">
                            {hoveredProduct.title}
                          </h4>
                          <p className="text-xs font-bold font-mono text-[#1C1917] mt-0.5">
                            {formatPrice(hoveredProduct.price)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectProduct(hoveredProduct)}
                        className="mt-2.5 w-full py-1.5 bg-[#1C1917] hover:bg-[#9C5432] text-white text-[11px] font-medium uppercase tracking-wider rounded-md transition-colors text-center block cursor-pointer"
                      >
                        Découvrir la Fiche →
                      </button>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#9C5432] font-semibold uppercase tracking-wider block">
                        Détail de la Scène
                      </span>
                      <h4 className="text-xs font-semibold text-[#1C1917]">
                        {hoveredHotspot.label || 'Pièce Décor Home'}
                      </h4>
                      <p className="text-[11px] text-[#78716C]">
                        Disponible sur demande au showroom Décor Home Béjaïa.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Caption Overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-white pointer-events-none z-10">
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
              {sceneProducts.length > 0 ? (
                sceneProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="p-3 rounded-xl border border-[#E8E2D8] hover:border-[#9C5432] hover:bg-[#FAF8F5] transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={p.images?.[0] || '/assets/images/hero_decor_home_salon_1793732697943.jpg'}
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
                ))
              ) : (activeScene.hotspots || []).length > 0 ? (
                (activeScene.hotspots || []).map((hs) => (
                  <div
                    key={hs.id}
                    onMouseEnter={() => handleOpenHotspot(hs.id)}
                    onMouseLeave={handleScheduleCloseHotspot}
                    onClick={() => handleOpenHotspot(hs.id)}
                    className="p-3 rounded-xl border border-[#E8E2D8] hover:border-[#9C5432] hover:bg-[#FAF8F5] transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-center text-[#9C5432] shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-[#1C1917] group-hover:text-[#9C5432] transition-colors truncate">
                          {hs.label}
                        </p>
                        <p className="text-[11px] text-[#78716C] mt-0.5">
                          Pièce de la mise en scène
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#A8A29E] group-hover:text-[#9C5432] shrink-0 ml-2" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#78716C] italic py-4 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#E8E2D8]">
                  Aucune pièce associée à cette ambiance pour le moment.
                </p>
              )}
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
