import React, { useState, useMemo } from 'react';
import { Search, Sparkles, SlidersHorizontal, MessageCircle, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product, Category, StoreSettings } from '../types';

interface CatalogProps {
  products: Product[];
  settings: StoreSettings;
  onSelectProduct: (product: Product) => void;
}

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'tous', label: 'Toutes les Pièces' },
  { id: 'luminaires', label: 'Luminaires' },
  { id: 'miroirs', label: 'Miroirs' },
  { id: 'vases-ceramiques', label: 'Vases & Céramiques' },
  { id: 'meubles-appoint', label: "Meubles d'Appoint" },
  { id: 'decoration-murale', label: 'Décoration Murale' },
  { id: 'arts-de-la-table', label: 'Arts de la Table' },
  { id: 'tapis-textiles', label: 'Tapis & Textiles' },
];

export type StatusFilter = 'all' | 'nouveautes' | 'coups-de-coeur' | 'in-stock';
export type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'newest';

export const Catalog: React.FC<CatalogProps> = ({
  products,
  settings,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('tous');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const cleanWhatsappNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'tous' && p.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter === 'nouveautes' && p.badge !== 'nouveaute') {
        return false;
      }
      if (statusFilter === 'coups-de-coeur' && p.badge !== 'coup-de-coeur') {
        return false;
      }
      if (statusFilter === 'in-stock' && !p.inStock) {
        return false;
      }

      // Search query (title, reference, material, description)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchRef = p.reference.toLowerCase().includes(query);
        const matchMaterial = p.material.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        if (!matchTitle && !matchRef && !matchMaterial && !matchDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') {
        if (a.badge === 'nouveaute' && b.badge !== 'nouveaute') return -1;
        if (b.badge === 'nouveaute' && a.badge !== 'nouveaute') return 1;
        return 0;
      }
      // default: recommended (featured first, then inStock)
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
      return 0;
    });
  }, [products, selectedCategory, statusFilter, searchQuery, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' DZD';
  };

  const getQuickWhatsappUrl = (product: Product) => {
    const message = `Bonjour Décor Home, je souhaite des informations sur le produit "${product.title}" (Réf: ${product.reference}) vu sur votre catalogue showroom. Est-il disponible pour une visite ?`;
    return `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="catalogue" className="py-16 bg-[#FAF8F5] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <p className="text-xs uppercase tracking-widest text-[#9C5432] font-semibold">
            Catalogue Showroom Interactif
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
            Les Pièces Singulières
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
            Parcourez nos collections actuelles exposées en boutique. Cliquez sur chaque pièce pour contempler ses détails, ses dimensions et nous contacter directement sur WhatsApp.
          </p>
        </div>

        {/* Dynamic Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar border-b border-[#E8E2D8]">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap rounded-md transition-colors cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#1C1917] text-white shadow-sm'
                    : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#EFECE6]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Filters Bar: Search, Status tabs & Sorting */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-white p-4 rounded-xl border border-[#E8E2D8] shadow-sm">
          
          {/* Instant Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, matière (travertin, laiton...), réf..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:outline-none focus:border-[#9C5432] text-[#1C1917] placeholder-[#A8A29E] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78716C] hover:text-[#1C1917]"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Quick Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === 'all'
                  ? 'bg-[#EFECE6] text-[#1C1917] font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Tous ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('nouveautes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === 'nouveautes'
                  ? 'bg-[#EFECE6] text-[#1C1917] font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Nouveautés
            </button>
            <button
              onClick={() => setStatusFilter('coups-de-coeur')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === 'coups-de-coeur'
                  ? 'bg-[#EFECE6] text-[#1C1917] font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              Coups de cœur
            </button>
            <button
              onClick={() => setStatusFilter('in-stock')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === 'in-stock'
                  ? 'bg-[#EFECE6] text-[#1C1917] font-semibold'
                  : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              En stock
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#78716C]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs bg-[#FAF8F5] border border-[#E8E2D8] rounded-md px-3 py-2 text-[#1C1917] focus:outline-none focus:border-[#9C5432] cursor-pointer"
            >
              <option value="recommended">Sélection Recommandée</option>
              <option value="price-asc">Prix : Croissant</option>
              <option value="price-desc">Prix : Décroissant</option>
              <option value="newest">Nouveautés en premier</option>
            </select>
          </div>

        </div>

        {/* Product Count Indicator */}
        <div className="flex items-center justify-between text-xs text-[#78716C] mb-6 px-1">
          <span>{filteredProducts.length} pièces exposées</span>
          {(searchQuery || selectedCategory !== 'tous' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory('tous');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="text-[#9C5432] hover:underline"
            >
              Réinitialiser tous les filtres
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E2D8] max-w-lg mx-auto p-8 space-y-4">
            <AlertCircle className="w-10 h-10 text-[#A8A29E] mx-auto" />
            <h3 className="font-serif text-xl text-[#1C1917]">Aucune pièce trouvée</h3>
            <p className="text-xs sm:text-sm text-[#78716C]">
              Aucun article ne correspond à votre recherche "{searchQuery}". Essayez d'autres mots-clés comme "laiton", "travertin", "chêne" ou réinitialisez les filtres.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('tous');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#1C1917] text-white text-xs uppercase tracking-wider rounded-md hover:bg-[#9C5432] transition-colors"
            >
              Voir Tout le Catalogue
            </button>
          </div>
        )}

        {/* Product Grid: 3-column desktop / 2-column mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const primaryImage = product.images?.[0] || '/src/assets/images/hero_decor_home_salon_1793732697943.jpg';
            const secondaryImage = product.images?.[1] || primaryImage;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-xl overflow-hidden border border-[#E8E2D8] hover:border-[#D6CEBE] hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Image Container with Hover Swap / Zoom */}
                <div 
                  onClick={() => onSelectProduct(product)}
                  className="relative aspect-[4/3] bg-[#F5F2EB] overflow-hidden cursor-pointer"
                >
                  <img
                    src={primaryImage}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Badges: Clean unboxed metadata per Zero-Pill rules */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.badge === 'coup-de-coeur' && (
                      <span className="text-[10px] tracking-widest uppercase font-semibold text-[#FAF8F5] bg-[#9C5432] px-2 py-0.5 rounded shadow-sm">
                        Coup de cœur
                      </span>
                    )}
                    {product.badge === 'nouveaute' && (
                      <span className="text-[10px] tracking-widest uppercase font-semibold text-[#1C1917] bg-[#EAE4D9] px-2 py-0.5 rounded shadow-sm">
                        Nouveauté
                      </span>
                    )}
                    {product.badge === 'exclusivite' && (
                      <span className="text-[10px] tracking-widest uppercase font-semibold text-white bg-[#1C1917] px-2 py-0.5 rounded shadow-sm">
                        Exclusivité
                      </span>
                    )}
                  </div>

                  {/* Stock Status subtle tag */}
                  <div className="absolute top-3 right-3">
                    {product.inStock ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50/90 backdrop-blur-sm px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>En stock</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-amber-800 bg-amber-50/90 backdrop-blur-sm px-2 py-0.5 rounded border border-amber-200">
                        Sur commande
                      </span>
                    )}
                  </div>

                  {/* Hover Quick Action Overlay */}
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProduct(product);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#1C1917] text-xs font-medium rounded-md shadow hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Fiche Détaillée</span>
                    </button>
                  </div>
                </div>

                {/* Card Content & Metadata */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    {/* Unboxed Metadata with Typographic Separator */}
                    <div className="flex items-center gap-2 text-[11px] text-[#78716C] uppercase tracking-wider">
                      <span>{product.category.replace('-', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#A8A29E]">{product.reference}</span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="font-serif text-lg font-medium text-[#1C1917] group-hover:text-[#9C5432] transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.title}
                    </h3>

                    {/* Material & Dimension preview */}
                    <p className="text-xs text-[#78716C] line-clamp-1">
                      {product.material}
                    </p>
                  </div>

                  {/* Card Bottom: Price & Quick WhatsApp Button */}
                  <div className="pt-3 border-t border-[#F5F2EB] flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-[#A8A29E] uppercase tracking-wider">Tarif Showroom</span>
                      <span className="text-base font-semibold text-[#1C1917] font-mono tabular-nums">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <a
                      href={getQuickWhatsappUrl(product)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Demander des informations sur WhatsApp"
                      className="p-2 text-[#25D366] hover:bg-[#25D366]/10 rounded-md transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
