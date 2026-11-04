import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  Image as ImageIcon,
  Upload,
  Check,
  Star,
  Loader2,
  Link as LinkIcon,
  ArrowLeft,
  LogOut,
  ExternalLink,
  Search,
  Package,
  Layers,
  Phone,
  Eye,
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react';
import { Product, StoreSettings, Category, BadgeType, LookbookScene, LookbookHotspot } from '../types';
import { CATEGORIES } from './Catalog';
import { 
  saveProductToFirestore, 
  deleteProductFromFirestore, 
  saveStoreSettingsToFirestore, 
  resetCatalogToDefault,
  saveLookbookToFirestore,
  deleteLookbookFromFirestore
} from '../firebase';
import { processImageFile } from '../utils/imageUtils';

interface AdminPageProps {
  products: Product[];
  settings: StoreSettings;
  lookbooks: LookbookScene[];
  onRefreshData: () => void;
  onNavigatePublic: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  products,
  settings,
  lookbooks,
  onRefreshData,
  onNavigatePublic,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('decor_home_admin_auth') === 'true';
  });
  const [pinCode, setPinCode] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active Tab: 'products' | 'lookbooks' | 'settings' | 'reset'
  const [activeTab, setActiveTab] = useState<'products' | 'lookbooks' | 'settings' | 'reset'>('products');

  // Lookbook Editing / Adding State
  const [editingLookbook, setEditingLookbook] = useState<LookbookScene | null>(null);
  const [isAddingLookbook, setIsAddingLookbook] = useState(false);
  const [lookbookForm, setLookbookForm] = useState<Partial<LookbookScene>>({
    title: '',
    subtitle: '',
    description: '',
    image: '',
    productIds: [],
    hotspots: []
  });

  const lookbookFileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingLookbookImage, setIsProcessingLookbookImage] = useState(false);
  const [showLookbookUrlInput, setShowLookbookUrlInput] = useState(false);
  const [lookbookUrlInput, setLookbookUrlInput] = useState('');
  
  // Hotspot addition state
  const [pendingHotspotPos, setPendingHotspotPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedHotspotProductId, setSelectedHotspotProductId] = useState<string>('');
  const [hotspotCustomLabel, setHotspotCustomLabel] = useState<string>('');

  // Search filter inside admin products table
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('tous');

  // Product Editing / Adding State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [productForm, setProductForm] = useState<Partial<Product>>({
    title: '',
    category: 'luminaires',
    price: 25000,
    currency: 'DZD',
    dimensions: 'H 50 cm × L 30 cm × P 30 cm',
    material: 'Laiton brossé & travertin beige',
    description: '',
    badge: 'aucun',
    inStock: true,
    reference: `DH-PIECE-${Math.floor(100 + Math.random() * 900)}`,
    images: [],
    instagramReelUrl: '',
    tiktokVideoUrl: '',
    featured: false,
  });

  // Local file upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });

  useEffect(() => {
    setSettingsForm({ ...settings });
  }, [settings]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === 'decor2026' || pinCode === 'admin' || pinCode === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('decor_home_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('decor_home_admin_auth');
    setPinCode('');
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Start adding a new product
  const startAddNew = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    setProductForm({
      title: '',
      category: 'luminaires',
      price: 25000,
      currency: 'DZD',
      dimensions: 'H 60 cm × L 40 cm',
      material: 'Travertin naturel & laiton brossé',
      description: 'Pièce exclusive travaillée dans des matières brutes et intemporelles.',
      badge: 'nouveaute',
      inStock: true,
      reference: `DH-${Math.floor(1000 + Math.random() * 9000)}`,
      images: [],
      instagramReelUrl: '',
      tiktokVideoUrl: '',
      featured: false,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start editing existing product
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddingNew(false);
    setProductForm({
      ...prod,
      images: prod.images ? [...prod.images] : []
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle file uploads from PC or Mobile
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    try {
      const processedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          const dataUrl = await processImageFile(file);
          processedUrls.push(dataUrl);
        }
      }

      if (processedUrls.length > 0) {
        const currentImages = productForm.images || [];
        setProductForm(prev => ({
          ...prev,
          images: [...currentImages, ...processedUrls]
        }));
        showNotification(`${processedUrls.length} photo(s) importée(s) avec succès depuis votre appareil !`);
      }
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de l'import des photos", 'error');
    } finally {
      setIsProcessingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Add image via URL (optional fallback)
  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      const currentImages = productForm.images || [];
      setProductForm(prev => ({
        ...prev,
        images: [...currentImages, newImageUrl.trim()]
      }));
      setNewImageUrl('');
      showNotification("Lien d'image ajouté");
    }
  };

  // Set an image as primary (move to index 0)
  const handleSetPrimary = (index: number) => {
    const current = [...(productForm.images || [])];
    if (index > 0 && index < current.length) {
      const [selected] = current.splice(index, 1);
      current.unshift(selected);
      setProductForm(prev => ({ ...prev, images: current }));
      showNotification('Photo principale mise à jour');
    }
  };

  // Remove an image from product form
  const handleRemoveImage = (indexToRemove: number) => {
    const current = productForm.images || [];
    setProductForm(prev => ({
      ...prev,
      images: current.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Save product (create or update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.category || !productForm.price) {
      showNotification('Veuillez remplir le titre, la catégorie et le prix', 'error');
      return;
    }

    try {
      const finalProduct: Product = {
        id: editingProduct ? editingProduct.id : `dh-${Date.now()}`,
        title: productForm.title || 'Nouvelle Pièce',
        category: (productForm.category as Category) || 'luminaires',
        price: Number(productForm.price) || 0,
        currency: 'DZD',
        dimensions: productForm.dimensions || 'Non spécifiées',
        material: productForm.material || 'Matières naturelles',
        description: productForm.description || '',
        badge: (productForm.badge as BadgeType) || 'aucun',
        inStock: productForm.inStock ?? true,
        reference: productForm.reference || `DH-${Date.now().toString().slice(-4)}`,
        images: productForm.images && productForm.images.length > 0 
          ? productForm.images 
          : ['/src/assets/images/hero_decor_home_salon_1793732697943.jpg'],
        instagramReelUrl: productForm.instagramReelUrl || '',
        tiktokVideoUrl: productForm.tiktokVideoUrl || '',
        featured: productForm.featured || false,
        updatedAt: new Date().toISOString()
      };

      await saveProductToFirestore(finalProduct);
      showNotification(
        editingProduct 
          ? 'Pièce mise à jour avec succès dans le catalogue !' 
          : 'Nouvelle pièce ajoutée avec succès au catalogue !'
      );
      setIsAddingNew(false);
      setEditingProduct(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors de l'enregistrement", 'error');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cette pièce du catalogue showroom ?')) {
      try {
        await deleteProductFromFirestore(productId);
        showNotification('Produit supprimé du catalogue');
        onRefreshData();
      } catch (err) {
        console.error(err);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  // Toggle inStock directly in table
  const handleToggleStock = async (prod: Product) => {
    try {
      const updated = { ...prod, inStock: !prod.inStock, updatedAt: new Date().toISOString() };
      await saveProductToFirestore(updated);
      showNotification(updated.inStock ? 'Pièce marquée En Stock' : 'Pièce marquée Sur Commande');
      onRefreshData();
    } catch (err) {
      console.error(err);
      showNotification('Erreur mise à jour stock', 'error');
    }
  };

  // Save store settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveStoreSettingsToFirestore(settingsForm);
      showNotification('Coordonnées de la boutique enregistrées avec succès !');
      onRefreshData();
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de la mise à jour des paramètres', 'error');
    }
  };

  // Reset database with default 20 items
  const handleResetCatalog = async () => {
    if (window.confirm('Voulez-vous réinitialiser le catalogue avec les 20 articles de référence officiels de Décor Home ?')) {
      try {
        await resetCatalogToDefault();
        showNotification('Catalogue réinitialisé avec succès avec les 20 pièces de référence !');
        onRefreshData();
      } catch (err) {
        console.error(err);
        showNotification('Erreur lors de la réinitialisation', 'error');
      }
    }
  };

  // Start adding new lookbook
  const startAddNewLookbook = () => {
    setIsAddingLookbook(true);
    setEditingLookbook(null);
    setLookbookForm({
      title: '',
      subtitle: '',
      description: '',
      image: '',
      productIds: [],
      hotspots: []
    });
    setPendingHotspotPos(null);
    setSelectedHotspotProductId('');
    setHotspotCustomLabel('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start editing existing lookbook
  const startEditLookbook = (scene: LookbookScene) => {
    setEditingLookbook(scene);
    setIsAddingLookbook(false);
    setLookbookForm({
      ...scene,
      productIds: scene.productIds ? [...scene.productIds] : [],
      hotspots: scene.hotspots ? [...scene.hotspots] : []
    });
    setPendingHotspotPos(null);
    setSelectedHotspotProductId('');
    setHotspotCustomLabel('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Lookbook Image upload from PC / Mobile
  const handleLookbookImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessingLookbookImage(true);
    try {
      const file = files[0];
      const processed = await processImageFile(file, 1600, 1200, 0.85);
      setLookbookForm(prev => ({
        ...prev,
        image: processed
      }));
      showNotification('Photo d\'ambiance importée avec succès !');
    } catch (err) {
      console.error(err);
      showNotification('Impossible de charger cette image', 'error');
    } finally {
      setIsProcessingLookbookImage(false);
      if (lookbookFileInputRef.current) {
        lookbookFileInputRef.current.value = '';
      }
    }
  };

  // Add Lookbook Image URL fallback
  const handleAddLookbookImageUrl = () => {
    if (lookbookUrlInput.trim()) {
      setLookbookForm(prev => ({
        ...prev,
        image: lookbookUrlInput.trim()
      }));
      setLookbookUrlInput('');
      setShowLookbookUrlInput(false);
      showNotification('Image d\'ambiance enregistrée !');
    }
  };

  // Toggle tagged product in Lookbook
  const handleToggleLookbookProduct = (prodId: string) => {
    const current = lookbookForm.productIds || [];
    if (current.includes(prodId)) {
      setLookbookForm(prev => ({
        ...prev,
        productIds: current.filter(id => id !== prodId),
        hotspots: (prev.hotspots || []).filter(h => h.productId !== prodId)
      }));
    } else {
      setLookbookForm(prev => ({
        ...prev,
        productIds: [...current, prodId]
      }));
    }
  };

  // Click on image to position a hotspot
  const handleLookbookImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setPendingHotspotPos({ x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) });
  };

  // Add Hotspot
  const handleAddHotspot = () => {
    if (!pendingHotspotPos) {
      showNotification('Cliquez sur la photo pour positionner la pastille', 'error');
      return;
    }
    if (!selectedHotspotProductId) {
      showNotification('Veuillez sélectionner le produit à associer à cette pastille', 'error');
      return;
    }

    const linkedProduct = products.find(p => p.id === selectedHotspotProductId);
    const label = hotspotCustomLabel.trim() || linkedProduct?.title || 'Pièce du Showroom';

    const newHs: LookbookHotspot = {
      id: `hs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x: pendingHotspotPos.x,
      y: pendingHotspotPos.y,
      productId: selectedHotspotProductId,
      label
    };

    // Ensure the product is in productIds
    const currentProductIds = lookbookForm.productIds || [];
    const updatedProductIds = currentProductIds.includes(selectedHotspotProductId)
      ? currentProductIds
      : [...currentProductIds, selectedHotspotProductId];

    setLookbookForm(prev => ({
      ...prev,
      productIds: updatedProductIds,
      hotspots: [...(prev.hotspots || []), newHs]
    }));

    setPendingHotspotPos(null);
    setSelectedHotspotProductId('');
    setHotspotCustomLabel('');
    showNotification('Pastille interactive "Shop the Look" ajoutée !');
  };

  // Remove Hotspot
  const handleRemoveHotspot = (hsId: string) => {
    setLookbookForm(prev => ({
      ...prev,
      hotspots: (prev.hotspots || []).filter(h => h.id !== hsId)
    }));
    showNotification('Pastille supprimée');
  };

  // Save Lookbook
  const handleSaveLookbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookbookForm.title || !lookbookForm.title.trim()) {
      showNotification('Veuillez donner un titre à votre Lookbook', 'error');
      return;
    }
    if (!lookbookForm.image) {
      showNotification('Veuillez ajouter une photo pour cette ambiance', 'error');
      return;
    }

    try {
      const finalScene: LookbookScene = {
        id: editingLookbook ? editingLookbook.id : `scene-${Date.now()}`,
        title: lookbookForm.title.trim(),
        subtitle: lookbookForm.subtitle?.trim() || 'Ambiance Décor Home',
        description: lookbookForm.description?.trim() || 'Mise en scène exclusive au showroom Décor Home.',
        image: lookbookForm.image,
        productIds: lookbookForm.productIds || [],
        hotspots: lookbookForm.hotspots || []
      };

      await saveLookbookToFirestore(finalScene);
      showNotification('Ambiance Lookbook enregistrée avec succès !');
      setIsAddingLookbook(false);
      setEditingLookbook(null);
      onRefreshData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      showNotification('Erreur lors de l\'enregistrement du Lookbook', 'error');
    }
  };

  // Delete Lookbook
  const handleDeleteLookbook = async (sceneId: string, sceneTitle: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le Lookbook "${sceneTitle}" ?`)) {
      try {
        await deleteLookbookFromFirestore(sceneId);
        showNotification('Lookbook supprimé');
        onRefreshData();
      } catch (err) {
        console.error(err);
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
  };

  // Filtered products list in table
  const filteredProducts = products.filter(item => {
    const matchesCat = categoryFilter === 'tous' || item.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      item.title.toLowerCase().includes(q) || 
      item.reference.toLowerCase().includes(q) ||
      item.material.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const inStockCount = products.filter(p => p.inStock).length;
  const outOfStockCount = products.length - inStockCount;

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1C1917] flex flex-col font-sans">
      
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#1C1917] text-[#FAF8F5] border-b border-[#292524] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-widest uppercase text-white">
                  DÉCOR HOME
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#9C5432] text-white rounded">
                  Back-Office Privé
                </span>
              </div>
              <p className="text-[11px] text-[#A8A29E] hidden sm:block">
                Espace dédié d'administration du catalogue & showroom de Béjaïa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Link to Visitor Public Showcase */}
            <button
              onClick={onNavigatePublic}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#FAF8F5] bg-[#292524] hover:bg-[#3E3835] rounded-md transition-colors cursor-pointer border border-[#44403C]"
              title="Retourner sur la vitrine vue par les visiteurs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C87D55]" />
              <span className="hidden sm:inline">Voir la Vitrine Visiteurs</span>
              <span className="sm:hidden">Vitrine</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#D6CEBE] hover:text-white hover:bg-[#292524] rounded-md transition-colors cursor-pointer"
                title="Verrouiller la session"
              >
                <LogOut className="w-3.5 h-3.5 text-[#A8A29E]" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 right-6 z-50 px-5 py-3 text-xs font-semibold rounded-lg shadow-xl transition-all border ${
          notification.type === 'success' 
            ? 'bg-emerald-700 text-white border-emerald-600' 
            : 'bg-rose-700 text-white border-rose-600'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* UNAUTHENTICATED: Private Access Gate */}
        {!isAuthenticated ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="bg-white max-w-md w-full p-8 sm:p-10 rounded-2xl shadow-xl border border-[#E8E2D8] text-center space-y-6">
              
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] text-[#9C5432] mx-auto flex items-center justify-center border border-[#E8E2D8] shadow-inner">
                <Lock className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#9C5432]">
                  Accès Restreint Gérant
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                  Administration Décor Home
                </h1>
                <p className="text-xs text-[#78716C] leading-relaxed">
                  Cette page est strictement réservée à l'équipe Décor Home pour gérer les pièces du showroom, les photos et les coordonnées.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 pt-2">
                <div className="text-left space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
                    Code d'Accès Administrateur
                  </label>
                  <input
                    type="password"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Entrez votre mot de passe (ex: decor2026)"
                    className="w-full text-center tracking-widest text-lg py-3 px-4 bg-[#FAF8F5] border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#9C5432] focus:ring-1 focus:ring-[#9C5432]"
                    autoFocus
                  />
                  {authError && (
                    <p className="text-xs text-rose-600 font-medium text-center pt-1">
                      Code d'accès incorrect. Veuillez réessayer.
                    </p>
                  )}
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-lg text-[11px] text-[#78716C] border border-[#E8E2D8] text-left">
                  <span>💡 Code d'accès par défaut : </span>
                  <strong className="text-[#1C1917] font-mono">decor2026</strong>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md"
                >
                  Accéder au Tableau de Bord
                </button>
              </form>

              <div className="pt-4 border-t border-[#E8E2D8]">
                <button
                  onClick={onNavigatePublic}
                  className="text-xs text-[#78716C] hover:text-[#1C1917] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Retourner à la vitrine visiteurs</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* AUTHENTICATED: Full Dedicated Back-Office Dashboard */
          <div className="space-y-8">
            
            {/* KPI Overview Summary Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Catalogue Actif</span>
                  <Package className="w-4 h-4 text-[#9C5432]" />
                </div>
                <div className="font-serif text-3xl font-bold text-[#1C1917]">
                  {products.length}
                </div>
                <span className="text-[11px] text-[#78716C]">Pièces de décoration</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Disponibilité</span>
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-serif text-3xl font-bold text-emerald-700">
                  {inStockCount}
                </div>
                <span className="text-[11px] text-[#78716C]">En stock au showroom ({outOfStockCount} sur commande)</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Showroom</span>
                  <Layers className="w-4 h-4 text-[#9C5432]" />
                </div>
                <div className="font-semibold text-sm text-[#1C1917] truncate">
                  Béjaïa (Cité Djama BT D)
                </div>
                <span className="text-[11px] text-[#78716C]">Plus Code: P2XX+CJ9</span>
              </div>

              <div className="bg-white p-5 rounded-xl border border-[#E8E2D8] shadow-xs">
                <div className="flex items-center justify-between text-[#78716C] mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">WhatsApp Showroom</span>
                  <Phone className="w-4 h-4 text-[#25D366]" />
                </div>
                <div className="font-mono text-sm font-semibold text-[#1C1917] truncate">
                  {settings.phone}
                </div>
                <span className="text-[11px] text-[#78716C]">Contact direct actif</span>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="bg-white rounded-xl border border-[#E8E2D8] shadow-xs p-1.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setIsAddingNew(false);
                    setEditingProduct(null);
                  }}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-[#1C1917] text-white shadow-sm'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5]'
                  }`}
                >
                  Articles & Photos ({products.length})
                </button>

                <button
                  onClick={() => {
                    setActiveTab('lookbooks');
                    setIsAddingLookbook(false);
                    setEditingLookbook(null);
                  }}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'lookbooks'
                      ? 'bg-[#1C1917] text-white shadow-sm'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C87D55]" />
                  <span>Lookbooks & Mises en Scène ({lookbooks.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-[#1C1917] text-white shadow-sm'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5]'
                  }`}
                >
                  Coordonnées & Réseaux Sociaux
                </button>

                <button
                  onClick={() => setActiveTab('reset')}
                  className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    activeTab === 'reset'
                      ? 'bg-[#1C1917] text-white shadow-sm'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5]'
                  }`}
                >
                  Maintenance & Données
                </button>
              </div>

              {activeTab === 'products' && !isAddingNew && !editingProduct && (
                <button
                  onClick={startAddNew}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#9C5432] hover:bg-[#854527] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une Nouvelle Pièce</span>
                </button>
              )}

              {activeTab === 'lookbooks' && !isAddingLookbook && !editingLookbook && (
                <button
                  onClick={startAddNewLookbook}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#9C5432] hover:bg-[#854527] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer un Nouveau Lookbook</span>
                </button>
              )}
            </div>

            {/* TAB 1: PRODUCTS MANAGEMENT */}
            {activeTab === 'products' && (
              <div>
                {!isAddingNew && !editingProduct ? (
                  <div className="space-y-6">
                    
                    {/* Filters & Search Row */}
                    <div className="bg-white p-4 rounded-xl border border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Rechercher par titre, réf, matière..."
                          className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-[#78716C] whitespace-nowrap">Catégorie :</span>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="text-xs bg-[#FAF8F5] border border-[#E8E2D8] rounded-md px-3 py-2 focus:border-[#9C5432] focus:outline-none cursor-pointer"
                        >
                          <option value="tous">Toutes les catégories</option>
                          {CATEGORIES.filter(c => c.id !== 'tous').map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-xl border border-[#E8E2D8] overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#78716C] uppercase font-semibold">
                            <tr>
                              <th className="py-3.5 px-4">Photo</th>
                              <th className="py-3.5 px-4">Titre & Référence</th>
                              <th className="py-3.5 px-4">Catégorie</th>
                              <th className="py-3.5 px-4">Tarif Showroom</th>
                              <th className="py-3.5 px-4">Stock</th>
                              <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E8E2D8]">
                            {filteredProducts.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="py-10 text-center text-[#78716C]">
                                  Aucun article trouvé correspondant à vos critères de recherche.
                                </td>
                              </tr>
                            ) : (
                              filteredProducts.map((item) => (
                                <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="relative w-14 h-12 rounded-lg overflow-hidden border border-[#E8E2D8] bg-[#FAF8F5]">
                                      <img
                                        src={item.images?.[0] || '/src/assets/images/hero_decor_home_salon_1793732697943.jpg'}
                                        alt={item.title}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                      />
                                      {item.images && item.images.length > 1 && (
                                        <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] px-1 font-mono">
                                          +{item.images.length - 1}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="font-semibold text-[#1C1917] max-w-xs truncate">
                                      {item.title}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[11px] font-mono text-[#78716C]">
                                        {item.reference}
                                      </span>
                                      {item.badge && item.badge !== 'aucun' && (
                                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-[#FAF8F5] border border-[#D6CEBE] text-[#9C5432] rounded font-semibold">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-[#57534E] capitalize">
                                    {item.category.replace('-', ' ')}
                                  </td>
                                  <td className="py-3 px-4 font-mono font-medium text-[#1C1917]">
                                    {new Intl.NumberFormat('fr-FR').format(item.price)} DZD
                                  </td>
                                  <td className="py-3 px-4">
                                    <button
                                      onClick={() => handleToggleStock(item)}
                                      className={`px-2.5 py-1 text-[11px] rounded font-medium border transition-colors cursor-pointer ${
                                        item.inStock
                                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                          : 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100'
                                      }`}
                                      title="Cliquer pour basculer la disponibilité"
                                    >
                                      {item.inStock ? '✓ En Stock' : '⏳ Sur Commande'}
                                    </button>
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <div className="inline-flex items-center gap-2">
                                      <button
                                        onClick={() => startEditProduct(item)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1C1917] bg-white hover:bg-[#FAF8F5] border border-[#D6CEBE] rounded-md transition-colors cursor-pointer shadow-2xs"
                                        title="Modifier cette pièce et ses photos"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-[#9C5432]" />
                                        <span>Modifier</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteProduct(item.id)}
                                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                        title="Supprimer définitivement"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* PRODUCT EDIT / ADD FORM */
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-sm max-w-4xl mx-auto space-y-8">
                    
                    <div className="flex items-center justify-between pb-6 border-b border-[#E8E2D8]">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9C5432]">
                          {isAddingNew ? 'Nouvelle Fiche Article' : 'Édition de Pièce'}
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-[#1C1917] mt-0.5">
                          {isAddingNew ? 'Ajouter une Pièce au Showroom' : `Modifier : ${productForm.title || editingProduct?.title}`}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(false);
                          setEditingProduct(null);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E2D8] rounded-md transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Retour au catalogue</span>
                      </button>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-8">
                      
                      {/* Hidden Native File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFiles(e.target.files)}
                      />

                      {/* PHOTO UPLOADER BOX (Native PC / Mobile File Upload) */}
                      <div className="p-6 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <label className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#9C5432]" />
                            <span>Photos de la Pièce ({productForm.images?.length || 0} photo(s))</span>
                          </label>
                          <span className="text-[11px] text-[#78716C]">
                            La 1ère photo avec l'étoile est la photo principale du catalogue
                          </span>
                        </div>

                        {/* Interactive Drag & Drop / Mobile & PC Selector */}
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`p-8 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer ${
                            isDragging
                              ? 'border-[#9C5432] bg-[#9C5432]/5'
                              : 'border-[#D6CEBE] hover:border-[#9C5432] bg-white'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isProcessingImages ? (
                            <div className="flex flex-col items-center justify-center space-y-2 py-4">
                              <Loader2 className="w-8 h-8 text-[#9C5432] animate-spin" />
                              <p className="text-xs font-semibold text-[#1C1917]">
                                Traitement et optimisation des photos en cours...
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] text-[#9C5432] mx-auto flex items-center justify-center shadow-sm border border-[#E8E2D8]">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#1C1917]">
                                  Cliquez pour sélectionner des photos depuis votre ordinateur ou smartphone
                                </p>
                                <p className="text-xs text-[#78716C] mt-1">
                                  Ou glissez vos images directement ici (JPG, PNG, WebP)
                                </p>
                              </div>
                              <button
                                type="button"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold rounded-md transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  fileInputRef.current?.click();
                                }}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Parcourir mes photos</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Optional URL addition */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => setShowUrlInput(!showUrlInput)}
                            className="text-xs text-[#78716C] hover:text-[#1C1917] underline flex items-center gap-1 cursor-pointer"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>{showUrlInput ? "Masquer l'ajout par URL" : "Ou ajouter une photo par lien web (optionnel)"}</span>
                          </button>

                          {showUrlInput && (
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                value={newImageUrl}
                                onChange={(e) => setNewImageUrl(e.target.value)}
                                placeholder="Collez l'adresse URL de l'image (https://...)"
                                className="flex-1 px-3 py-2 text-xs bg-white border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E2D8] text-xs font-semibold rounded-md transition-colors cursor-pointer"
                              >
                                Ajouter
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Thumbnails Gallery */}
                        {productForm.images && productForm.images.length > 0 ? (
                          <div className="space-y-2 pt-2">
                            <span className="text-[11px] font-semibold text-[#57534E] uppercase tracking-wider block">
                              Photos enregistrées pour cet article ({productForm.images.length}) :
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                              {productForm.images.map((url, idx) => (
                                <div 
                                  key={idx} 
                                  className={`relative group rounded-xl overflow-hidden border-2 aspect-[4/3] bg-white transition-all shadow-sm ${
                                    idx === 0 ? 'border-[#9C5432] ring-2 ring-[#9C5432]/20' : 'border-[#E8E2D8]'
                                  }`}
                                >
                                  <img
                                    src={url}
                                    alt={`Photo ${idx + 1}`}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />

                                  {/* Primary Badge */}
                                  {idx === 0 ? (
                                    <span className="absolute top-1.5 left-1.5 text-[9px] uppercase tracking-wider font-bold bg-[#9C5432] text-white px-2 py-0.5 rounded shadow">
                                      ★ Principale
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimary(idx)}
                                      className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 text-[9px] uppercase tracking-wider font-semibold bg-black/80 hover:bg-[#9C5432] text-white px-2 py-0.5 rounded transition-all shadow cursor-pointer"
                                      title="Définir comme photo principale"
                                    >
                                      Définir principale
                                    </button>
                                  )}

                                  {/* Delete Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-rose-600 text-white rounded transition-colors shadow cursor-pointer"
                                    title="Supprimer cette photo"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-white rounded-lg border border-dashed border-[#D6CEBE] text-center text-xs text-[#78716C]">
                            Aucune photo pour l'instant. Ajoutez au moins une photo pour présenter cette pièce.
                          </div>
                        )}
                      </div>

                      {/* PRODUCT FIELDS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Titre de la Pièce Décorative *
                          </label>
                          <input
                            type="text"
                            required
                            value={productForm.title || ''}
                            onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                            placeholder="ex: Lampadaire Sculptural en Plâtre 'Lumen Arch'"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Catégorie Showroom *
                          </label>
                          <select
                            value={productForm.category || 'luminaires'}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value as Category })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none cursor-pointer"
                          >
                            {CATEGORIES.filter(c => c.id !== 'tous').map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Tarif Showroom (en DZD) *
                          </label>
                          <input
                            type="number"
                            required
                            value={productForm.price || 0}
                            onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Référence Unique
                          </label>
                          <input
                            type="text"
                            value={productForm.reference || ''}
                            onChange={(e) => setProductForm({ ...productForm, reference: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none font-mono"
                            placeholder="ex: DH-LUM-01"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Badge Mis en Avant
                          </label>
                          <select
                            value={productForm.badge || 'aucun'}
                            onChange={(e) => setProductForm({ ...productForm, badge: e.target.value as BadgeType })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none cursor-pointer"
                          >
                            <option value="aucun">Aucun badge</option>
                            <option value="nouveaute">Nouveauté</option>
                            <option value="coup-de-coeur">Coup de Cœur</option>
                            <option value="exclusivite">Exclusivité</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Dimensions (HxLxP)
                          </label>
                          <input
                            type="text"
                            value={productForm.dimensions || ''}
                            onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                            placeholder="ex: H 175 cm × L 52 cm × P 40 cm"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Matières Nobles & Finitions
                          </label>
                          <input
                            type="text"
                            value={productForm.material || ''}
                            onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                            placeholder="ex: Travertin romain beige adouci & laiton brossé"
                          />
                        </div>

                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Description & Conseils de Mise en Scène
                          </label>
                          <textarea
                            rows={4}
                            value={productForm.description || ''}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                            placeholder="Décrivez l'esprit de l'objet, le toucher de la matière et les accords recommandés..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Lien Vidéo Instagram Reel (optionnel)
                          </label>
                          <input
                            type="url"
                            value={productForm.instagramReelUrl || ''}
                            onChange={(e) => setProductForm({ ...productForm, instagramReelUrl: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                            placeholder="https://instagram.com/reel/..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                            Lien Vidéo TikTok (optionnel)
                          </label>
                          <input
                            type="url"
                            value={productForm.tiktokVideoUrl || ''}
                            onChange={(e) => setProductForm({ ...productForm, tiktokVideoUrl: e.target.value })}
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                            placeholder="https://tiktok.com/@.../video/..."
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-3 p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8]">
                          <input
                            type="checkbox"
                            id="stockCheckbox"
                            checked={productForm.inStock ?? true}
                            onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                            className="w-4 h-4 text-[#9C5432] rounded focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="stockCheckbox" className="text-xs font-semibold text-[#1C1917] cursor-pointer">
                            Pièce disponible immédiatement en boutique à Béjaïa (décocher pour afficher "Sur commande")
                          </label>
                        </div>

                      </div>

                      <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E8E2D8]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNew(false);
                            setEditingProduct(null);
                          }}
                          className="px-5 py-2.5 text-xs font-medium text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-7 py-3 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>Enregistrer les Modifications</span>
                        </button>
                      </div>

                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB LOOKBOOKS: LOOKBOOKS & AMBIANCES */}
            {activeTab === 'lookbooks' && (
              <div className="space-y-6">
                {!isAddingLookbook && !editingLookbook ? (
                  <div className="space-y-6">
                    {/* Header banner */}
                    <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#9C5432] font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Mises en Scène & Ambiance</span>
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-[#1C1917] mt-1">
                          Gestion des Lookbooks Décor Home
                        </h2>
                        <p className="text-xs text-[#78716C] mt-1 max-w-2xl leading-relaxed">
                          Chaque Lookbook présente une mise en scène photographique de votre showroom ou de vos réalisations. Vous pouvez y épingler des pastilles interactives « Shop the Look » directement sur les objets visibles dans la photo pour renvoyer vos clients vers la fiche du produit correspondant !
                        </p>
                      </div>

                      <button
                        onClick={startAddNewLookbook}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9C5432] hover:bg-[#854527] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Créer une Nouvelle Ambiance</span>
                      </button>
                    </div>

                    {/* Lookbooks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {lookbooks.map((scene) => {
                        const sceneProducts = (scene.productIds || [])
                          .map((id) => products.find((p) => p.id === id))
                          .filter((p): p is Product => Boolean(p));

                        return (
                          <div
                            key={scene.id}
                            className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-xs flex flex-col group hover:border-[#9C5432] transition-colors"
                          >
                            {/* Visual Preview */}
                            <div className="relative aspect-[16/10] bg-[#1C1917] overflow-hidden">
                              <img
                                src={scene.image}
                                alt={scene.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5">
                                <Tag className="w-3 h-3 text-[#C87D55]" />
                                <span>{(scene.hotspots || []).length} pastilles</span>
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white">
                                <span className="text-[10px] uppercase tracking-wider text-[#EAD8C3] font-semibold block">
                                  {scene.subtitle}
                                </span>
                                <h3 className="font-serif text-lg font-medium leading-snug">
                                  {scene.title}
                                </h3>
                              </div>
                            </div>

                            {/* Details & Tagged Items */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div>
                                <p className="text-xs text-[#78716C] line-clamp-2 leading-relaxed">
                                  {scene.description}
                                </p>

                                {/* Tagged Products */}
                                <div className="mt-3">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#57534E] block mb-1.5">
                                    Articles du Catalogue Associés ({sceneProducts.length}) :
                                  </span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {sceneProducts.length > 0 ? (
                                      sceneProducts.map((p) => (
                                        <span
                                          key={p.id}
                                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F5] border border-[#E8E2D8] rounded-md text-[11px] text-[#1C1917]"
                                        >
                                          {p.images?.[0] && (
                                            <img
                                              src={p.images[0]}
                                              alt=""
                                              className="w-4 h-4 rounded object-cover"
                                            />
                                          )}
                                          <span className="truncate max-w-[120px]">{p.title}</span>
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[11px] text-[#A8A29E] italic">
                                        Aucun produit lié pour le moment
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-between gap-3">
                                <button
                                  onClick={() => startEditLookbook(scene)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#1C1917] bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D6CEBE] rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-[#9C5432]" />
                                  <span>Modifier l'Ambiance</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteLookbook(scene.id, scene.title)}
                                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Supprimer cette ambiance"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Supprimer</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* LOOKBOOK CREATE / EDIT FORM */
                  <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-sm max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9C5432]">
                          Mise en Scène Showroom
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                          {editingLookbook ? `Modifier : ${editingLookbook.title}` : 'Créer une Nouvelle Ambiance Lookbook'}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingLookbook(false);
                          setEditingLookbook(null);
                        }}
                        className="text-xs text-[#78716C] hover:text-[#1C1917] px-3 py-1.5 border border-[#E8E2D8] rounded-md transition-colors cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>

                    <form onSubmit={handleSaveLookbook} className="space-y-8">
                      {/* Section 1: Informations Générales */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#9C5432]">
                          1. Titre & Thème de l'Ambiance
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1C1917]">
                              Titre de la Scène *
                            </label>
                            <input
                              type="text"
                              value={lookbookForm.title || ''}
                              onChange={(e) => setLookbookForm({ ...lookbookForm, title: e.target.value })}
                              placeholder="ex: Salon Contemporain & Chêne Massif"
                              required
                              className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#1C1917]">
                              Sous-titre / Thème Décoratif
                            </label>
                            <input
                              type="text"
                              value={lookbookForm.subtitle || ''}
                              onChange={(e) => setLookbookForm({ ...lookbookForm, subtitle: e.target.value })}
                              placeholder="ex: Équilibre entre minimalisme et sérénité méditerranéenne"
                              className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-[#1C1917]">
                            Description de l'Ambiance
                          </label>
                          <textarea
                            rows={3}
                            value={lookbookForm.description || ''}
                            onChange={(e) => setLookbookForm({ ...lookbookForm, description: e.target.value })}
                            placeholder="Décrivez l'esprit de cette pièce, les jeux de lumière, les associations de matières..."
                            className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none resize-none"
                          />
                        </div>
                      </div>

                      {/* Section 2: Photo de la Scène */}
                      <div className="space-y-4 pt-4 border-t border-[#E8E2D8]">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9C5432]">
                            2. Photo Haute Définition de la Pièce *
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowLookbookUrlInput(!showLookbookUrlInput)}
                            className="text-[11px] text-[#78716C] hover:text-[#1C1917] underline cursor-pointer"
                          >
                            {showLookbookUrlInput ? 'Masquer lien web' : 'Ou coller une URL d\'image'}
                          </button>
                        </div>

                        {showLookbookUrlInput && (
                          <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] flex gap-2">
                            <input
                              type="url"
                              value={lookbookUrlInput}
                              onChange={(e) => setLookbookUrlInput(e.target.value)}
                              placeholder="https://images.unsplash.com/photo-..."
                              className="flex-1 px-3 py-2 text-xs bg-white border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#9C5432]"
                            />
                            <button
                              type="button"
                              onClick={handleAddLookbookImageUrl}
                              className="px-4 py-2 bg-[#1C1917] text-white text-xs font-medium rounded-lg hover:bg-[#9C5432] transition-colors"
                            >
                              Appliquer
                            </button>
                          </div>
                        )}

                        {/* Hidden file input */}
                        <input
                          ref={lookbookFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleLookbookImageFiles(e.target.files)}
                        />

                        {/* Drag and Drop / Upload Button */}
                        <div
                          onClick={() => lookbookFileInputRef.current?.click()}
                          className="border-2 border-dashed border-[#D6CEBE] hover:border-[#9C5432] bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-[#E8E2D8] flex items-center justify-center text-[#9C5432]">
                              {isProcessingLookbookImage ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                              ) : (
                                <Upload className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-semibold text-[#1C1917]">
                                Importer la photo de la scène depuis votre PC ou Mobile
                              </p>
                              <p className="text-[11px] text-[#78716C] mt-1">
                                JPG, PNG ou WEBP · Compression automatique haute fidélité
                              </p>
                            </div>
                            <span className="px-4 py-1.5 bg-[#1C1917] text-white text-xs font-medium rounded-lg">
                              Parcourir les fichiers
                            </span>
                          </div>
                        </div>

                        {/* Image Preview with Interactive Hotspot Placement */}
                        {lookbookForm.image && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#1C1917]">
                                Aperçu de la scène & Positionnement des pastilles
                              </span>
                              <span className="text-[#9C5432] font-medium">
                                💡 Astuce : Cliquez sur la photo pour positionner une pastille !
                              </span>
                            </div>

                            <div
                              onClick={handleLookbookImageClick}
                              className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#1C1917] border border-[#E8E2D8] cursor-crosshair group shadow-inner"
                              title="Cliquez n'importe où sur l'image pour placer une pastille"
                            >
                              <img
                                src={lookbookForm.image}
                                alt="Aperçu ambiance"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />

                              {/* Render Existing Hotspots */}
                              {(lookbookForm.hotspots || []).map((hs) => {
                                const prod = products.find((p) => p.id === hs.productId);
                                return (
                                  <div
                                    key={hs.id}
                                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="w-7 h-7 rounded-full bg-white text-[#9C5432] shadow-lg flex items-center justify-center border-2 border-[#9C5432] font-bold text-xs">
                                      <Tag className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="hidden group-hover/pin:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1C1917] text-white text-[11px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap z-30">
                                      {hs.label || prod?.title}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* Pending Hotspot Indicator */}
                              {pendingHotspotPos && (
                                <div
                                  style={{ left: `${pendingHotspotPos.x}%`, top: `${pendingHotspotPos.y}%` }}
                                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                                >
                                  <div className="w-8 h-8 rounded-full bg-[#9C5432] text-white flex items-center justify-center animate-bounce shadow-xl">
                                    <Tag className="w-4 h-4" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Hotspot Creator Sub-Panel */}
                            {pendingHotspotPos && (
                              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3 animate-in fade-in">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-[#9C5432]" />
                                    <span className="text-xs font-bold text-[#1C1917]">
                                      Nouvelle Pastille positionnée à ({pendingHotspotPos.x}%, {pendingHotspotPos.y}%)
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setPendingHotspotPos(null)}
                                    className="text-xs text-[#78716C] hover:text-rose-600"
                                  >
                                    Annuler ce point
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[#57534E]">
                                      Associer à une pièce du catalogue *
                                    </label>
                                    <select
                                      value={selectedHotspotProductId}
                                      onChange={(e) => {
                                        setSelectedHotspotProductId(e.target.value);
                                        const p = products.find(prod => prod.id === e.target.value);
                                        if (p && !hotspotCustomLabel) {
                                          setHotspotCustomLabel(p.title);
                                        }
                                      }}
                                      className="w-full px-3 py-2 text-xs bg-white border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#9C5432]"
                                    >
                                      <option value="">Sélectionner un produit...</option>
                                      {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                          {p.title} ({p.reference}) - {new Intl.NumberFormat('fr-FR').format(p.price)} DZD
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[#57534E]">
                                      Libellé affiché sur la pastille
                                    </label>
                                    <input
                                      type="text"
                                      value={hotspotCustomLabel}
                                      onChange={(e) => setHotspotCustomLabel(e.target.value)}
                                      placeholder="ex: Vase Galet Zen en Grès"
                                      className="w-full px-3 py-2 text-xs bg-white border border-[#D6CEBE] rounded-lg focus:outline-none focus:border-[#9C5432]"
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={handleAddHotspot}
                                    className="px-4 py-2 bg-[#9C5432] text-white text-xs font-semibold rounded-lg hover:bg-[#854527] transition-colors cursor-pointer"
                                  >
                                    + Épingler cette Pastille sur l'Image
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* List of Current Hotspots */}
                            {(lookbookForm.hotspots || []).length > 0 && (
                              <div className="space-y-2 pt-2">
                                <span className="text-xs font-semibold text-[#57534E] block">
                                  Pastilles actives sur cette scène ({(lookbookForm.hotspots || []).length}) :
                                </span>
                                <div className="space-y-1.5">
                                  {(lookbookForm.hotspots || []).map((hs) => {
                                    const linkedProd = products.find(p => p.id === hs.productId);
                                    return (
                                      <div
                                        key={hs.id}
                                        className="flex items-center justify-between p-2.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg text-xs"
                                      >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                          <Tag className="w-3.5 h-3.5 text-[#9C5432] shrink-0" />
                                          <span className="font-medium text-[#1C1917] truncate">{hs.label}</span>
                                          {linkedProd && (
                                            <span className="text-[11px] text-[#78716C] font-mono shrink-0">
                                              ({new Intl.NumberFormat('fr-FR').format(linkedProd.price)} DZD)
                                            </span>
                                          )}
                                          <span className="text-[10px] text-[#A8A29E] shrink-0">
                                            [Pos: {hs.x}%, {hs.y}%]
                                          </span>
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => handleRemoveHotspot(hs.id)}
                                          className="text-rose-600 hover:text-rose-800 p-1 transition-colors cursor-pointer"
                                          title="Supprimer cette pastille"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Section 3: Produits Associés */}
                      <div className="space-y-3 pt-4 border-t border-[#E8E2D8]">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#9C5432]">
                            3. Pièces du Showroom Associées à cette Ambiance
                          </h3>
                          <p className="text-[11px] text-[#78716C] mt-0.5">
                            Cochez les produits qui composent cette mise en scène. Ils apparaîtront dans la colonne « Objets de la Scène » sur le site.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-2 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8]">
                          {products.map((p) => {
                            const isSelected = (lookbookForm.productIds || []).includes(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleToggleLookbookProduct(p.id)}
                                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-white border-[#9C5432] shadow-xs'
                                    : 'bg-white/60 border-transparent hover:border-[#D6CEBE]'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}} // handled by parent div
                                  className="w-4 h-4 rounded text-[#9C5432] focus:ring-[#9C5432]"
                                />
                                {p.images?.[0] && (
                                  <img
                                    src={p.images[0]}
                                    alt=""
                                    className="w-8 h-8 rounded object-cover bg-[#FAF8F5] shrink-0"
                                  />
                                )}
                                <div className="overflow-hidden">
                                  <p className="font-medium text-[#1C1917] truncate">{p.title}</p>
                                  <p className="text-[10px] text-[#78716C] font-mono">{new Intl.NumberFormat('fr-FR').format(p.price)} DZD</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Form Submit & Cancel */}
                      <div className="pt-6 border-t border-[#E8E2D8] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingLookbook(false);
                            setEditingLookbook(null);
                          }}
                          className="px-5 py-2.5 text-xs font-semibold text-[#57534E] hover:text-[#1C1917] border border-[#D6CEBE] rounded-lg transition-colors cursor-pointer"
                        >
                          Annuler
                        </button>

                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 px-7 py-3 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>Enregistrer le Lookbook</span>
                        </button>
                      </div>

                    </form>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: STORE SETTINGS & SOCIAL LINKS */}
            {activeTab === 'settings' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-sm max-w-4xl mx-auto space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                    Coordonnées du Showroom & Réseaux Sociaux
                  </h2>
                  <p className="text-xs text-[#78716C] mt-1">
                    Ces données personnalisent les coordonnées visibles par vos clients sur les boutons WhatsApp, Instagram, TikTok et Google Maps.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                        Nom de l'Enseigne
                      </label>
                      <input
                        type="text"
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                        Numéro WhatsApp Direct (sans espace ni +)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none font-mono"
                        placeholder="213550123456"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                        Téléphone Showroom (format affiché)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                        Lien Compte Instagram
                      </label>
                      <input
                        type="url"
                        value={settingsForm.instagramUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                        Lien Compte TikTok
                      </label>
                      <input
                        type="url"
                        value={settingsForm.tiktokUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                        Lien Google Maps Showroom
                      </label>
                      <input
                        type="url"
                        value={settingsForm.googleMapsUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                        Adresse Physique Showroom
                      </label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                        Horaires Semaine (Lundi - Samedi)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.hoursWeekday}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hoursWeekday: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider">
                        Horaires Vendredi & Dimanche
                      </label>
                      <input
                        type="text"
                        value={settingsForm.hoursWeekend}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hoursWeekend: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                  </div>

                  <div className="pt-6 border-t border-[#E8E2D8] flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-7 py-3 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer les Coordonnées</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: MAINTENANCE & DATA RESET */}
            {activeTab === 'reset' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8E2D8] shadow-sm max-w-3xl mx-auto space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                    Maintenance & Données du Catalogue
                  </h2>
                  <p className="text-xs text-[#78716C] mt-1">
                    Gestion des données et outils de restauration si nécessaire.
                  </p>
                </div>

                <div className="p-6 rounded-xl border border-amber-200 bg-amber-50/70 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        Restaurer le Catalogue Officiel de Démonstration (20 Pièces)
                      </h3>
                      <p className="text-xs text-amber-800 mt-1">
                        Si vous avez supprimé des éléments par inadvertance, vous pouvez réinitialiser la base de données avec les 20 articles de référence de Décor Home.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleResetCatalog}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Recharger le Catalogue d'Origine</span>
                  </button>
                </div>

                <div className="p-6 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] space-y-2">
                  <h3 className="text-xs font-bold text-[#1C1917] uppercase tracking-wide">
                    Stockage & Optimisation des Photos
                  </h3>
                  <p className="text-xs text-[#78716C] leading-relaxed">
                    Les images importées depuis votre téléphone ou PC sont automatiquement compressées et redimensionnées pour garantir des temps de chargement ultra-rapides sur mobile pour vos clients.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Admin Page Footer */}
      <footer className="mt-auto border-t border-[#E8E2D8] bg-white py-4 px-6 text-center text-xs text-[#78716C]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <span>Décor Home · Module d'Administration Dédié (Accès restreint)</span>
          <button
            onClick={onNavigatePublic}
            className="text-[#9C5432] hover:underline font-medium cursor-pointer"
          >
            ← Revenir à la vitrine visiteurs
          </button>
        </div>
      </footer>

    </div>
  );
};
