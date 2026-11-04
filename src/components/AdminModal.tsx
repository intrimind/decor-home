import React, { useState, useRef } from 'react';
import { 
  X, 
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
  Link as LinkIcon
} from 'lucide-react';
import { Product, StoreSettings, Category, BadgeType } from '../types';
import { CATEGORIES } from './Catalog';
import { saveProductToFirestore, deleteProductFromFirestore, saveStoreSettingsToFirestore, resetCatalogToDefault } from '../firebase';
import { processImageFile } from '../utils/imageUtils';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: StoreSettings;
  onRefreshData: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  settings,
  onRefreshData,
}) => {
  if (!isOpen) return null;

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active Tab: 'products' | 'settings' | 'reset'
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'reset'>('products');

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

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinCode === 'decor2026' || pinCode === 'admin' || pinCode === '1234') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
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
      material: 'Travertin naturel & laiton poli',
      description: 'Pièce exclusive travaillée dans des matières brutes et intemporelles.',
      badge: 'nouveaute',
      inStock: true,
      reference: `DH-${Math.floor(1000 + Math.random() * 9000)}`,
      images: [],
      instagramReelUrl: '',
      tiktokVideoUrl: '',
      featured: false,
    });
  };

  // Start editing existing product
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddingNew(false);
    setProductForm({
      ...prod,
      images: prod.images ? [...prod.images] : []
    });
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
      showNotification('Erreur lors de l\'import des photos', 'error');
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
      showNotification('Lien d\'image ajouté');
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
      showNotification('Erreur lors de l\'enregistrement', 'error');
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      <div 
        className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-[#E8E2D8] max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D8] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[#1C1917] text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1C1917]">
                Back-Office Décor Home
              </h2>
              <span className="text-[11px] text-[#78716C]">
                Gestion du catalogue showroom & des coordonnées
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#78716C] hover:text-[#1C1917] hover:bg-[#EFECE6] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className={`px-6 py-2.5 text-xs font-medium text-center transition-all ${
            notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        {/* PIN Authentication Gate */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto my-auto text-center space-y-6">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] text-[#9C5432] mx-auto flex items-center justify-center border border-[#E8E2D8]">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl text-[#1C1917]">Espace Administrateur</h3>
              <p className="text-xs text-[#78716C]">
                Veuillez saisir votre code d'accès pour modifier le catalogue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="Code d'accès (ex: decor2026)"
                  className="w-full text-center tracking-widest text-lg py-3 px-4 bg-[#FAF8F5] border border-[#E8E2D8] rounded-lg focus:outline-none focus:border-[#9C5432]"
                  autoFocus
                />
                {authError && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">
                    Code d'accès incorrect. Essayez : decor2026
                  </p>
                )}
              </div>

              <div className="p-2.5 bg-[#FAF8F5] rounded text-[11px] text-[#78716C] border border-[#E8E2D8]">
                <span>Mot de passe de démonstration : </span>
                <strong className="text-[#1C1917] font-mono">decor2026</strong>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Déverrouiller le Back-Office
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#E8E2D8] bg-[#FAF8F5]">
              <button
                onClick={() => {
                  setActiveTab('products');
                  setIsAddingNew(false);
                  setEditingProduct(null);
                }}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'products'
                    ? 'border-[#9C5432] text-[#9C5432]'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Catalogue ({products.length} Pièces)
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-[#9C5432] text-[#9C5432]'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Coordonnées & Réseaux
              </button>

              <button
                onClick={() => setActiveTab('reset')}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'reset'
                    ? 'border-[#9C5432] text-[#9C5432]'
                    : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Maintenance & Démo
              </button>
            </div>

            {/* Tab 1: Products CRUD */}
            {activeTab === 'products' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Mode Switch: List vs Form */}
                {!isAddingNew && !editingProduct ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#78716C]">
                        Gérez, modifiez et ajoutez les articles présentés sur le catalogue showroom.
                      </p>
                      <button
                        onClick={startAddNew}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Ajouter une Pièce</span>
                      </button>
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-xl border border-[#E8E2D8] overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF8F5] border-b border-[#E8E2D8] text-[#78716C] uppercase font-semibold">
                          <tr>
                            <th className="py-3 px-4">Photo</th>
                            <th className="py-3 px-4">Titre & Réf</th>
                            <th className="py-3 px-4">Catégorie</th>
                            <th className="py-3 px-4">Tarif</th>
                            <th className="py-3 px-4">Disponibilité</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E2D8]">
                          {products.map((item) => (
                            <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                              <td className="py-2.5 px-4">
                                <img
                                  src={item.images?.[0] || '/src/assets/images/hero_decor_home_salon_1793732697943.jpg'}
                                  alt={item.title}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-10 object-cover rounded bg-[#FAF8F5] border border-[#E8E2D8]"
                                />
                              </td>
                              <td className="py-2.5 px-4">
                                <div className="font-semibold text-[#1C1917] max-w-xs truncate">
                                  {item.title}
                                </div>
                                <div className="text-[11px] font-mono text-[#78716C]">
                                  {item.reference}
                                </div>
                              </td>
                              <td className="py-2.5 px-4 text-[#57534E]">
                                {item.category.replace('-', ' ')}
                              </td>
                              <td className="py-2.5 px-4 font-mono font-medium text-[#1C1917]">
                                {new Intl.NumberFormat('fr-FR').format(item.price)} DZD
                              </td>
                              <td className="py-2.5 px-4">
                                {item.inStock ? (
                                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                                    En stock
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
                                    Sur commande
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    onClick={() => startEditProduct(item)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#1C1917] bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E2D8] rounded transition-colors cursor-pointer"
                                    title="Modifier cette pièce"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-[#9C5432]" />
                                    <span>Modifier</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(item.id)}
                                    className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Add / Edit Form */
                  <form onSubmit={handleSaveProduct} className="space-y-6 max-w-3xl">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D8]">
                      <div>
                        <span className="text-xs uppercase tracking-wider font-semibold text-[#9C5432]">
                          {isAddingNew ? 'Création d\'article' : 'Modification d\'article'}
                        </span>
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917] mt-0.5">
                          {isAddingNew ? 'Ajouter une Nouvelle Pièce au Showroom' : `Modifier : ${productForm.title || editingProduct?.title}`}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(false);
                          setEditingProduct(null);
                        }}
                        className="px-3 py-1.5 text-xs text-[#78716C] hover:text-[#1C1917] bg-[#FAF8F5] border border-[#E8E2D8] rounded-md transition-colors"
                      >
                        ← Retour à la liste
                      </button>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />

                    {/* PHOTO UPLOADER SECTION (Featured at top of form for convenience) */}
                    <div className="p-5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#9C5432]" />
                          <span>Photos de la Pièce ({productForm.images?.length || 0} photo(s))</span>
                        </label>
                        <span className="text-[11px] text-[#78716C]">
                          La 1ère photo est l'image principale affichée sur le catalogue
                        </span>
                      </div>

                      {/* Dropzone & PC/Mobile File Selector Button */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`p-6 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer ${
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
                              <p className="text-xs sm:text-sm font-semibold text-[#1C1917]">
                                Cliquez ici pour importer des photos depuis votre PC ou Téléphone
                              </p>
                              <p className="text-xs text-[#78716C] mt-1">
                                Ou glissez-déposez vos fichiers directement ici (JPG, PNG, WebP · Sélection multiple acceptée)
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
                              <span>Parcourir mes fichiers</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Collapsible URL input option */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(!showUrlInput)}
                          className="text-xs text-[#78716C] hover:text-[#1C1917] underline flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>{showUrlInput ? 'Masquer l\'ajout par lien URL' : 'Ajouter une photo par lien URL (optionnel)'}</span>
                        </button>

                        {showUrlInput && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={newImageUrl}
                              onChange={(e) => setNewImageUrl(e.target.value)}
                              placeholder="Collez l'URL d'une image (ex: https://...)"
                              className="flex-1 px-3 py-2 text-xs bg-white border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleAddImageUrl}
                              className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#E8E2D8] text-xs font-semibold rounded-md transition-colors"
                            >
                              Ajouter
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Thumbnails Gallery Strip */}
                      {productForm.images && productForm.images.length > 0 ? (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-semibold text-[#57534E] uppercase tracking-wider block">
                            Photos sélectionnées pour cet article ({productForm.images.length}) :
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                                    className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 text-[9px] uppercase tracking-wider font-semibold bg-black/80 hover:bg-[#9C5432] text-white px-2 py-0.5 rounded transition-all shadow"
                                    title="Définir comme photo principale"
                                  >
                                    Définir principale
                                  </button>
                                )}

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-1.5 right-1.5 p-1 bg-black/75 hover:bg-rose-600 text-white rounded transition-colors shadow"
                                  title="Supprimer cette photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-white rounded-lg border border-dashed border-[#D6CEBE] text-center text-xs text-[#78716C]">
                          Aucune photo importée pour le moment. Cliquez sur la zone ci-dessus pour ajouter des photos depuis votre appareil.
                        </div>
                      )}
                    </div>

                    {/* GENERAL PRODUCT FIELDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Titre du Produit *</label>
                        <input
                          type="text"
                          required
                          value={productForm.title || ''}
                          onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                          placeholder="ex: Lampadaire Sculptural en Plâtre 'Lumen Arch'"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Catégorie *</label>
                        <select
                          value={productForm.category || 'luminaires'}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value as Category })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none cursor-pointer"
                        >
                          {CATEGORIES.filter(c => c.id !== 'tous').map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Tarif Showroom (en DZD) *</label>
                        <input
                          type="number"
                          required
                          value={productForm.price || 0}
                          onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Référence Unique</label>
                        <input
                          type="text"
                          value={productForm.reference || ''}
                          onChange={(e) => setProductForm({ ...productForm, reference: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none font-mono"
                          placeholder="ex: DH-LUM-01"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Badge Mis en Avant</label>
                        <select
                          value={productForm.badge || 'aucun'}
                          onChange={(e) => setProductForm({ ...productForm, badge: e.target.value as BadgeType })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none cursor-pointer"
                        >
                          <option value="aucun">Aucun badge</option>
                          <option value="nouveaute">Nouveauté</option>
                          <option value="coup-de-coeur">Coup de Cœur</option>
                          <option value="exclusivite">Exclusivité</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Dimensions (HxLxP)</label>
                        <input
                          type="text"
                          value={productForm.dimensions || ''}
                          onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                          placeholder="ex: H 175 cm × L 52 cm × P 40 cm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Matières & Finitions</label>
                        <input
                          type="text"
                          value={productForm.material || ''}
                          onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                          placeholder="ex: Travertin romain beige adouci & laiton brossé"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Description & Inspiration</label>
                        <textarea
                          rows={3}
                          value={productForm.description || ''}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                          placeholder="Décrivez la texture, le travail d'artisanat et la mise en scène idéale..."
                        />
                      </div>

                      {/* Video URLs */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Lien Instagram Reel (optionnel)</label>
                        <input
                          type="url"
                          value={productForm.instagramReelUrl || ''}
                          onChange={(e) => setProductForm({ ...productForm, instagramReelUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                          placeholder="https://instagram.com/reel/..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-[#1C1917]">Lien Vidéo TikTok (optionnel)</label>
                        <input
                          type="url"
                          value={productForm.tiktokVideoUrl || ''}
                          onChange={(e) => setProductForm({ ...productForm, tiktokVideoUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                          placeholder="https://tiktok.com/@.../video/..."
                        />
                      </div>

                      {/* Stock Checkbox */}
                      <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="stockCheckbox"
                          checked={productForm.inStock ?? true}
                          onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                          className="w-4 h-4 text-[#9C5432] rounded focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="stockCheckbox" className="text-xs font-medium text-[#1C1917] cursor-pointer">
                          Pièce disponible immédiatement au Showroom (si décoché : sur commande)
                        </label>
                      </div>

                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D8]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNew(false);
                          setEditingProduct(null);
                        }}
                        className="px-4 py-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917]"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        <span>Enregistrer les Modifications</span>
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

            {/* Tab 2: Store & Social Settings */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-3xl space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                    Coordonnées du Showroom & Réseaux Sociaux
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1">
                    Ces informations sont utilisées pour les boutons de contact direct WhatsApp, Instagram, TikTok et les horaires du showroom.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#1C1917]">Nom de l'Enseigne</label>
                      <input
                        type="text"
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#1C1917]">Numéro WhatsApp (avec indicatif pays, sans +)</label>
                      <input
                        type="text"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none font-mono"
                        placeholder="ex: 213550123456"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#1C1917]">Téléphone Showroom (affiché)</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#1C1917]">Lien Profil Instagram</label>
                      <input
                        type="url"
                        value={settingsForm.instagramUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#1C1917]">Lien Compte TikTok</label>
                      <input
                        type="url"
                        value={settingsForm.tiktokUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#1C1917]">Lien Google Maps</label>
                      <input
                        type="url"
                        value={settingsForm.googleMapsUrl}
                        onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-medium text-[#1C1917]">Adresse Physique du Showroom</label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#1C1917]">Horaires Semaine</label>
                      <input
                        type="text"
                        value={settingsForm.hoursWeekday}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hoursWeekday: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-[#1C1917]">Horaires Weekend / Vendredi</label>
                      <input
                        type="text"
                        value={settingsForm.hoursWeekend}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hoursWeekend: e.target.value })}
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E2D8] rounded-md focus:border-[#9C5432] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E8E2D8] flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1C1917] hover:bg-[#9C5432] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Enregistrer les Coordonnées</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 3: Maintenance & Reset */}
            {activeTab === 'reset' && (
              <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-6">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                    Maintenance & Données Démo
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1">
                    Outils de synchronisation et de réinitialisation du catalogue de démonstration.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                        Réinitialiser le Catalogue de Démonstration
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        Cette action recharge les 20 articles phares de Décor Home avec leurs photos haute définition.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleResetCatalog}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Recharger les 20 Articles Démo</span>
                  </button>
                </div>

                <div className="p-5 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] space-y-2">
                  <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wide">
                    Synchronisation et Import Photos
                  </h4>
                  <p className="text-xs text-[#78716C]">
                    Toutes les photos importées depuis votre PC ou smartphone sont automatiquement compressées et sauvegardées localement et synchronisées en temps réel.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};
