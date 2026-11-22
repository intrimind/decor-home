import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { Product, StoreSettings, LookbookScene, LookbookHotspot, Category, BadgeType } from './types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS, LOOKBOOK_SCENES } from './data/initialProducts';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const STORAGE_BUCKET = 'decor-images';

// LocalStorage cache keys (lightweight URL cache, no base64 bloat)
const LOCAL_PRODUCTS_KEY = 'decor_home_sb_products_v1';
const LOCAL_SETTINGS_KEY = 'decor_home_sb_settings_v1';
const LOCAL_LOOKBOOKS_KEY = 'decor_home_sb_lookbooks_v1';

// In-memory live caches
let memoryProducts: Product[] | null = null;
let memorySettings: StoreSettings | null = null;
let memoryLookbooks: LookbookScene[] | null = null;

function normalizeAssetUrl(url?: string): string {
  if (!url) return '';
  return url.replace('/src/assets/images/', '/assets/images/');
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    price: Number(product.price) || 0,
    reference: product.reference || '',
    dimensions: product.dimensions || '',
    material: product.material || '',
    description: product.description || '',
    images: (product.images || []).map((img) => normalizeAssetUrl(img)).filter(Boolean),
  };
}

function normalizeStoreSettings(settings: StoreSettings): StoreSettings {
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...settings,
    heroImage: normalizeAssetUrl(settings.heroImage) || DEFAULT_STORE_SETTINGS.heroImage,
    showroomImage: normalizeAssetUrl(settings.showroomImage) || DEFAULT_STORE_SETTINGS.showroomImage,
  };
}

function normalizeLookbook(scene: LookbookScene): LookbookScene {
  return {
    ...scene,
    image: normalizeAssetUrl(scene.image),
    hotspots: Array.isArray(scene.hotspots) ? scene.hotspots : [],
    productIds: Array.isArray(scene.productIds) ? scene.productIds : [],
  };
}

function sortProductsByRecency(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    const timeA = Date.parse(a.updatedAt || a.createdAt || '') || 0;
    const timeB = Date.parse(b.updatedAt || b.createdAt || '') || 0;
    return timeB - timeA;
  });
}

// Row <-> App Model Mappers
interface ProductRow {
  id: string;
  title: string;
  category: string;
  price: number;
  currency: string;
  dimensions: string;
  material: string;
  description: string;
  badge: string;
  in_stock: boolean;
  reference: string;
  images: string[];
  instagram_reel_url: string;
  tiktok_video_url: string;
  featured: boolean;
  created_at?: string;
  updated_at?: string;
}

interface LookbookRow {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  hotspots: LookbookHotspot[];
  product_ids: string[];
  created_at?: string;
  updated_at?: string;
}

function rowToProduct(row: ProductRow): Product {
  return normalizeProduct({
    id: row.id,
    title: row.title || '',
    category: (row.category as Category) || 'luminaires',
    price: Number(row.price) || 0,
    currency: row.currency || 'DZD',
    dimensions: row.dimensions || '',
    material: row.material || '',
    description: row.description || '',
    badge: (row.badge as BadgeType) || 'aucun',
    inStock: row.in_stock ?? true,
    reference: row.reference || '',
    images: Array.isArray(row.images) ? row.images : [],
    instagramReelUrl: row.instagram_reel_url || '',
    tiktokVideoUrl: row.tiktok_video_url || '',
    featured: Boolean(row.featured),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function productToRow(product: Product): ProductRow {
  const n = normalizeProduct(product);
  const now = new Date().toISOString();
  return {
    id: n.id,
    title: n.title,
    category: n.category,
    price: Number(n.price) || 0,
    currency: n.currency || 'DZD',
    dimensions: n.dimensions || '',
    material: n.material || '',
    description: n.description || '',
    badge: n.badge || 'aucun',
    in_stock: n.inStock ?? true,
    reference: n.reference || '',
    images: n.images || [],
    instagram_reel_url: n.instagramReelUrl || '',
    tiktok_video_url: n.tiktokVideoUrl || '',
    featured: Boolean(n.featured),
    created_at: n.createdAt || now,
    updated_at: n.updatedAt || now,
  };
}

function rowToLookbook(row: LookbookRow): LookbookScene {
  return normalizeLookbook({
    id: row.id,
    title: row.title || '',
    subtitle: row.subtitle || '',
    description: row.description || '',
    image: row.image || '',
    hotspots: Array.isArray(row.hotspots) ? row.hotspots : [],
    productIds: Array.isArray(row.product_ids) ? row.product_ids : [],
  });
}

function lookbookToRow(scene: LookbookScene): LookbookRow {
  const n = normalizeLookbook(scene);
  return {
    id: n.id,
    title: n.title,
    subtitle: n.subtitle || '',
    description: n.description || '',
    image: n.image || '',
    hotspots: n.hotspots || [],
    product_ids: n.productIds || [],
    updated_at: new Date().toISOString(),
  };
}

// Local Cache Getters/Setters
export function getLocalProducts(): Product[] {
  if (memoryProducts !== null) return memoryProducts;
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeProduct);
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_PRODUCTS;
}

export function saveLocalProducts(products: Product[]): void {
  const sorted = sortProductsByRecency(products.map(normalizeProduct));
  memoryProducts = sorted;
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(sorted));
  } catch {
    try {
      localStorage.removeItem(LOCAL_PRODUCTS_KEY);
    } catch {
      // ignore
    }
  }
}

export function getLocalStoreSettings(): StoreSettings {
  if (memorySettings !== null) return memorySettings;
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      return normalizeStoreSettings(JSON.parse(raw) as StoreSettings);
    }
  } catch {
    // ignore
  }
  return DEFAULT_STORE_SETTINGS;
}

export function saveLocalStoreSettings(settings: StoreSettings): void {
  const normalized = normalizeStoreSettings(settings);
  memorySettings = normalized;
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(normalized));
  } catch {
    try {
      localStorage.removeItem(LOCAL_SETTINGS_KEY);
    } catch {
      // ignore
    }
  }
}

export function getLocalLookbooks(): LookbookScene[] {
  if (memoryLookbooks !== null) return memoryLookbooks;
  try {
    const raw = localStorage.getItem(LOCAL_LOOKBOOKS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeLookbook);
      }
    }
  } catch {
    // ignore
  }
  return LOOKBOOK_SCENES;
}

export function saveLocalLookbooks(scenes: LookbookScene[]): void {
  const normalized = scenes.map(normalizeLookbook);
  memoryLookbooks = normalized;
  try {
    localStorage.setItem(LOCAL_LOOKBOOKS_KEY, JSON.stringify(normalized));
  } catch {
    try {
      localStorage.removeItem(LOCAL_LOOKBOOKS_KEY);
    } catch {
      // ignore
    }
  }
}

// Fetch everything from Supabase
export async function fetchStoreDataFromSupabase(): Promise<{
  products: Product[];
  lookbooks: LookbookScene[];
  settings: StoreSettings;
  isSeeded: boolean;
  error?: string;
}> {
  if (!supabase) {
    return {
      products: getLocalProducts(),
      lookbooks: getLocalLookbooks(),
      settings: getLocalStoreSettings(),
      isSeeded: false,
      error: 'SUPABASE_NOT_CONFIGURED',
    };
  }

  const [prodRes, lookRes, setRes] = await Promise.all([
    supabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('lookbooks')
      .select('*')
      .order('created_at', { ascending: true }),
    supabase
      .from('store_settings')
      .select('*')
      .eq('id', 'main')
      .maybeSingle(),
  ]);

  const firstError = prodRes.error || lookRes.error || setRes.error;
  if (firstError) {
    console.warn('Supabase read error:', firstError.message);
    return {
      products: getLocalProducts(),
      lookbooks: getLocalLookbooks(),
      settings: getLocalStoreSettings(),
      isSeeded: false,
      error: firstError.message,
    };
  }

  const hasSettingsRow = Boolean(setRes.data && setRes.data.data);
  const rawProducts = (prodRes.data || []) as ProductRow[];
  const rawLookbooks = (lookRes.data || []) as LookbookRow[];

  // If DB is completely empty and has never been seeded yet, display initial catalog until admin seeds
  const isUnseededEmptyDb =
    !hasSettingsRow && rawProducts.length === 0 && rawLookbooks.length === 0;

  if (isUnseededEmptyDb) {
    saveLocalProducts(INITIAL_PRODUCTS);
    saveLocalLookbooks(LOOKBOOK_SCENES);
    saveLocalStoreSettings(DEFAULT_STORE_SETTINGS);
    return {
      products: INITIAL_PRODUCTS,
      lookbooks: LOOKBOOK_SCENES,
      settings: DEFAULT_STORE_SETTINGS,
      isSeeded: false,
    };
  }

  const products = sortProductsByRecency(rawProducts.map(rowToProduct));
  const lookbooks = rawLookbooks.map(rowToLookbook);
  const settings = hasSettingsRow
    ? normalizeStoreSettings(setRes.data!.data as StoreSettings)
    : DEFAULT_STORE_SETTINGS;

  saveLocalProducts(products);
  saveLocalLookbooks(lookbooks);
  saveLocalStoreSettings(settings);

  return {
    products,
    lookbooks,
    settings,
    isSeeded: true,
  };
}

// Subscribe to live database updates (and fetch immediately)
export function subscribeToStoreData(callbacks: {
  onProducts: (products: Product[]) => void;
  onLookbooks: (scenes: LookbookScene[]) => void;
  onSettings: (settings: StoreSettings) => void;
}): () => void {
  let active = true;

  const loadAll = async () => {
    const res = await fetchStoreDataFromSupabase();
    if (!active) return;
    callbacks.onProducts(res.products);
    callbacks.onLookbooks(res.lookbooks);
    callbacks.onSettings(res.settings);
  };

  loadAll();

  if (!supabase) {
    return () => {
      active = false;
    };
  }

  const channel = supabase
    .channel('decor-home-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      () => {
        loadAll();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'lookbooks' },
      () => {
        loadAll();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'store_settings' },
      () => {
        loadAll();
      }
    )
    .subscribe();

  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

// Ensure initial catalog is written to Supabase once on first admin login
export async function ensureInitialSeedOnAdminLogin(): Promise<boolean> {
  if (!supabase) return false;
  const { data: settingsRow, error: settingsErr } = await supabase
    .from('store_settings')
    .select('id')
    .eq('id', 'main')
    .maybeSingle();

  if (settingsErr) {
    throw new Error(settingsErr.message);
  }

  if (settingsRow) {
    return false; // Already seeded
  }

  const { count: prodCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true });

  const { count: lookCount } = await supabase
    .from('lookbooks')
    .select('id', { count: 'exact', head: true });

  if ((prodCount || 0) === 0) {
    const rows = INITIAL_PRODUCTS.map((p, idx) => {
      const ts = new Date(Date.now() - (INITIAL_PRODUCTS.length - idx) * 1000).toISOString();
      return productToRow({ ...p, createdAt: ts, updatedAt: ts });
    });
    const { error } = await supabase.from('products').upsert(rows);
    if (error) throw new Error(error.message);
  }

  if ((lookCount || 0) === 0) {
    const lookRows = LOOKBOOK_SCENES.map(lookbookToRow);
    const { error } = await supabase.from('lookbooks').upsert(lookRows);
    if (error) throw new Error(error.message);
  }

  const { error: setSaveErr } = await supabase
    .from('store_settings')
    .upsert({ id: 'main', data: DEFAULT_STORE_SETTINGS });
  if (setSaveErr) throw new Error(setSaveErr.message);

  return true;
}

// Authentication Helpers
export async function signInAdmin(email: string, password: string): Promise<Session> {
  if (!supabase) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.session) {
    throw new Error(error?.message || 'Identifiants invalides');
  }
  return data.session;
}

export async function signOutAdmin(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getAdminSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAdminAuthChange(callback: (session: Session | null) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => {
    data.subscription.unsubscribe();
  };
}

// Upload compressed data URL image to Supabase Storage and return public URL
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function uploadImageToStorage(
  dataUrl: string,
  folder: 'products' | 'lookbooks' | 'site'
): Promise<string> {
  if (!supabase) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const blob = dataUrlToBlob(dataUrl);
  const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, blob, {
      contentType: blob.type || 'image/jpeg',
      cacheControl: '31536000',
      upsert: true,
    });

  if (error) {
    throw new Error(`STORAGE_ERROR: ${error.message}`);
  }

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

// CRUD Operations
export async function saveProductToSupabase(product: Product): Promise<void> {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  const row = productToRow(product);
  const { error } = await supabase.from('products').upsert(row);
  if (error) throw new Error(error.message);

  const normalized = rowToProduct(row);
  const current = getLocalProducts();
  const idx = current.findIndex((p) => p.id === normalized.id);
  if (idx >= 0) {
    current[idx] = normalized;
  } else {
    current.unshift(normalized);
  }
  saveLocalProducts(current);
}

export async function deleteProductFromSupabase(productId: string): Promise<void> {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) throw new Error(error.message);

  const current = getLocalProducts().filter((p) => p.id !== productId);
  saveLocalProducts(current);
}

export async function saveStoreSettingsToSupabase(settings: StoreSettings): Promise<void> {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  const normalized = normalizeStoreSettings(settings);
  const { error } = await supabase
    .from('store_settings')
    .upsert({ id: 'main', data: normalized });
  if (error) throw new Error(error.message);

  saveLocalStoreSettings(normalized);
}

export async function saveLookbookToSupabase(scene: LookbookScene): Promise<void> {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  const row = lookbookToRow(scene);
  const { error } = await supabase.from('lookbooks').upsert(row);
  if (error) throw new Error(error.message);

  const normalized = rowToLookbook(row);
  const current = getLocalLookbooks();
  const idx = current.findIndex((s) => s.id === normalized.id);
  if (idx >= 0) {
    current[idx] = normalized;
  } else {
    current.push(normalized);
  }
  saveLocalLookbooks(current);
}

export async function deleteLookbookFromSupabase(sceneId: string): Promise<void> {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
  const { error } = await supabase.from('lookbooks').delete().eq('id', sceneId);
  if (error) throw new Error(error.message);

  const current = getLocalLookbooks().filter((s) => s.id !== sceneId);
  saveLocalLookbooks(current);
}

export async function resetCatalogToDefault(): Promise<void> {
  if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');

  // Remove existing rows first
  await supabase.from('products').delete().neq('id', '');
  await supabase.from('lookbooks').delete().neq('id', '');

  const prodRows = INITIAL_PRODUCTS.map((p, idx) => {
    const ts = new Date(Date.now() - (INITIAL_PRODUCTS.length - idx) * 1000).toISOString();
    return productToRow({ ...p, createdAt: ts, updatedAt: ts });
  });
  const { error: prodErr } = await supabase.from('products').upsert(prodRows);
  if (prodErr) throw new Error(prodErr.message);

  const lookRows = LOOKBOOK_SCENES.map(lookbookToRow);
  const { error: lookErr } = await supabase.from('lookbooks').upsert(lookRows);
  if (lookErr) throw new Error(lookErr.message);

  const { error: setErr } = await supabase
    .from('store_settings')
    .upsert({ id: 'main', data: DEFAULT_STORE_SETTINGS });
  if (setErr) throw new Error(setErr.message);

  saveLocalProducts(INITIAL_PRODUCTS);
  saveLocalLookbooks(LOOKBOOK_SCENES);
  saveLocalStoreSettings(DEFAULT_STORE_SETTINGS);
}
