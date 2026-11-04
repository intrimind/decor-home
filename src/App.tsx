import React, { useEffect, useState } from 'react';
import { Product, StoreSettings, LookbookScene } from './types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS, LOOKBOOK_SCENES } from './data/initialProducts';
import { 
  testConnection, 
  subscribeToProducts, 
  subscribeToStoreSettings, 
  subscribeToLookbooks,
  getLocalProducts, 
  getLocalStoreSettings,
  getLocalLookbooks
} from './firebase';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Catalog } from './components/Catalog';
import { LookbookSection } from './components/LookbookSection';
import { ShowroomSection } from './components/ShowroomSection';
import { ContactPage } from './components/ContactPage';
import { ProductModal } from './components/ProductModal';
import { AdminPage } from './components/AdminPage';
import { Footer } from './components/Footer';
import { MessageCircle } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(getLocalProducts() || INITIAL_PRODUCTS);
  const [settings, setSettings] = useState<StoreSettings>(getLocalStoreSettings() || DEFAULT_STORE_SETTINGS);
  const [lookbooks, setLookbooks] = useState<LookbookScene[]>(getLocalLookbooks() || LOOKBOOK_SCENES);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Dedicated Route View: 'public' | 'admin'
  const [currentView, setCurrentView] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;
      return (
        path === '/admin' || 
        path.startsWith('/admin') || 
        hash === '#admin' || 
        hash.startsWith('#admin') ||
        search.includes('admin')
      ) ? 'admin' : 'public';
    }
    return 'public';
  });

  // Initialize connection validation & Firestore subscriptions
  useEffect(() => {
    testConnection();

    const unsubProducts = subscribeToProducts((updated) => {
      if (updated && updated.length > 0) {
        setProducts(updated);
      }
    });

    const unsubSettings = subscribeToStoreSettings((updated) => {
      if (updated) {
        setSettings(updated);
      }
    });

    const unsubLookbooks = subscribeToLookbooks((updated) => {
      if (updated && updated.length > 0) {
        setLookbooks(updated);
      }
    });

    return () => {
      unsubProducts();
      unsubSettings();
      unsubLookbooks();
    };
  }, []);

  // Handle URL hash, search and pathname for routing + keyboard shortcut
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;
      const search = window.location.search;

      // Check if visiting admin dedicated page
      if (
        pathname === '/admin' || 
        pathname.startsWith('/admin') || 
        hash === '#admin' || 
        hash.startsWith('#admin') ||
        search.includes('admin')
      ) {
        setCurrentView('admin');
        return;
      } else {
        setCurrentView('public');
      }

      if (pathname === '/contact' || hash === '#contact') {
        setTimeout(() => {
          handleNavigateSection('contact');
        }, 150);
      }

      if (hash && hash.startsWith('#produit-')) {
        const ref = hash.replace('#produit-', '');
        const found = products.find((p) => p.reference.toLowerCase() === ref.toLowerCase());
        if (found) {
          setSelectedProduct(found);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Keyboard shortcut: Alt + A or Ctrl + Shift + A to open admin portal
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || 
          (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a'))) {
        e.preventDefault();
        navigateTo(currentView === 'admin' ? 'public' : 'admin');
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [products, currentView]);

  const navigateTo = (view: 'public' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') {
      window.history.pushState(null, '', '/#admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.history.pushState(null, '', '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreClick = () => {
    handleNavigateSection('catalogue');
  };

  const handleRefreshData = () => {
    setProducts(getLocalProducts());
    setSettings(getLocalStoreSettings());
    setLookbooks(getLocalLookbooks());
  };

  // WhatsApp Floating CTA for visitors on mobile
  const cleanWhatsappNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const floatingWhatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    'Bonjour Décor Home, je souhaite échanger sur une pièce de votre catalogue showroom.'
  )}`;

  // IF ADMIN PAGE: Render dedicated Admin Back-Office Application
  if (currentView === 'admin') {
    return (
      <AdminPage
        products={products}
        settings={settings}
        lookbooks={lookbooks}
        onRefreshData={handleRefreshData}
        onNavigatePublic={() => navigateTo('public')}
      />
    );
  }

  // IF PUBLIC SHOWROOM: Pure Visitor Showcase without any visible admin buttons
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col selection:bg-[#EAD8C3] selection:text-[#1C1917]">
      
      {/* Top Bar Navigation (Clean public customer interface) */}
      <Navbar
        settings={settings}
        onNavigateSection={handleNavigateSection}
      />

      <main className="flex-1">
        {/* Magazine-style Hero Section */}
        <Hero
          settings={settings}
          onExploreClick={handleExploreClick}
        />

        {/* Dynamic Catalog & Filters */}
        <Catalog
          products={products}
          settings={settings}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* Lookbook & Interactive "Shop the Look" Section */}
        <LookbookSection
          scenes={lookbooks}
          products={products}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />

        {/* Showroom & Physical Contact Section with Exact Map Coordinates */}
        <ShowroomSection
          settings={settings}
        />

        {/* Dedicated Contact, Social Links & Google Maps Section */}
        <ContactPage
          settings={settings}
        />
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onOpenAdmin={() => navigateTo('admin')}
        onNavigateSection={handleNavigateSection}
      />

      {/* Product Detail Modal (PDP) */}
      <ProductModal
        product={selectedProduct}
        allProducts={products}
        settings={settings}
        onClose={() => setSelectedProduct(null)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Mobile Floating WhatsApp Shortcut for Direct Customer Inquiries */}
      <a
        href={floatingWhatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 p-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center sm:hidden"
        aria-label="Contacter sur WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

    </div>
  );
}
