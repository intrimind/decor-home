import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, StoreSettings, LookbookScene } from './types';
import { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS, LOOKBOOK_SCENES } from './data/initialProducts';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Operation types for strict error auditing
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot as required by skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline. Utilizing local synchronized storage.");
    }
    return false;
  }
}

// LocalStorage cache keys
const LOCAL_PRODUCTS_KEY = 'decor_home_products_v1';
const LOCAL_SETTINGS_KEY = 'decor_home_settings_v1';
const LOCAL_DELETED_PRODUCTS_KEY = 'decor_home_deleted_products_v1';
const LOCAL_PRODUCTS_INIT_KEY = 'decor_home_products_initialized_v1';

export function getDeletedProductIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function addDeletedProductId(id: string): void {
  try {
    const current = getDeletedProductIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(LOCAL_DELETED_PRODUCTS_KEY, JSON.stringify(current));
    }
  } catch {
    // ignore
  }
}

function normalizeAssetUrl(url?: string): string {
  if (!url) return '';
  return url.replace('/src/assets/images/', '/assets/images/');
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    images: (product.images || []).map(img => normalizeAssetUrl(img))
  };
}

function normalizeStoreSettings(settings: StoreSettings): StoreSettings {
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...settings,
    heroImage: normalizeAssetUrl(settings.heroImage) || DEFAULT_STORE_SETTINGS.heroImage,
    showroomImage: normalizeAssetUrl(settings.showroomImage) || DEFAULT_STORE_SETTINGS.showroomImage
  };
}

export function getLocalProducts(): Product[] {
  const deletedIds = getDeletedProductIds();
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(p => !deletedIds.includes(p.id)).map(normalizeProduct);
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_PRODUCTS.filter(p => !deletedIds.includes(p.id));
}

export function saveLocalProducts(products: Product[]): void {
  const deletedIds = getDeletedProductIds();
  const filtered = products.filter(p => !deletedIds.includes(p.id)).map(normalizeProduct);
  try {
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function getLocalStoreSettings(): StoreSettings {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.address && !parsed.address.includes('Bir Mourad')) {
        return normalizeStoreSettings(parsed);
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_STORE_SETTINGS;
}

export function saveLocalStoreSettings(settings: StoreSettings): void {
  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(normalizeStoreSettings(settings)));
  } catch {
    // ignore
  }
}

// Subscribe to Products in Firestore with seamless local cache seeding and fallback
export function subscribeToProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const colPath = 'products';
  let hasReceivedSnapshot = false;

  const unsubscribe = onSnapshot(
    collection(db, colPath),
    async (snapshot) => {
      hasReceivedSnapshot = true;
      const deletedIds = getDeletedProductIds();
      const hasInitialized = localStorage.getItem(LOCAL_PRODUCTS_INIT_KEY) === 'true';

      if (snapshot.empty) {
        if (!hasInitialized) {
          localStorage.setItem(LOCAL_PRODUCTS_INIT_KEY, 'true');
          const seedItems = INITIAL_PRODUCTS.filter(p => !deletedIds.includes(p.id));
          try {
            for (const item of seedItems) {
              await setDoc(doc(db, colPath, item.id), item);
            }
          } catch (e) {
            console.warn("Could not seed firestore automatically:", e);
          }
          onUpdate(seedItems);
          saveLocalProducts(seedItems);
        } else {
          // If already initialized and empty, owner intentionally deleted all products
          onUpdate([]);
          saveLocalProducts([]);
        }
      } else {
        localStorage.setItem(LOCAL_PRODUCTS_INIT_KEY, 'true');
        const loaded: Product[] = [];
        snapshot.forEach((d) => {
          if (!deletedIds.includes(d.id)) {
            loaded.push(normalizeProduct({ id: d.id, ...d.data() } as Product));
          } else {
            // Clean up from Firestore if marked deleted locally
            deleteDoc(doc(db, colPath, d.id)).catch(() => {});
          }
        });
        onUpdate(loaded);
        saveLocalProducts(loaded);
      }
    },
    (error) => {
      console.warn("Firestore onSnapshot error, falling back to local catalog:", error);
      if (!hasReceivedSnapshot) {
        onUpdate(getLocalProducts());
      }
      if (onError) {
        onError(error);
      }
    }
  );

  return unsubscribe;
}

// Save or Update Product
export async function saveProductToFirestore(product: Product): Promise<void> {
  const normalized = normalizeProduct(product);

  // Guard against Firestore 1 MiB document size limit before writing
  const payloadSize = new Blob([JSON.stringify(normalized)]).size;
  if (payloadSize > 950_000) {
    throw new Error('DOCUMENT_TOO_LARGE: Les photos de cet article dépassent la taille maximale autorisée (1 Mo). Veuillez réduire le nombre de photos.');
  }

  // Sync with Firestore first so failures are surfaced instead of silent local-only drift
  try {
    await setDoc(doc(db, 'products', normalized.id), normalized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `products/${normalized.id}`);
  }

  // Update local storage cache after confirmed Firestore write
  try {
    const deletedIds = getDeletedProductIds().filter(id => id !== normalized.id);
    localStorage.setItem(LOCAL_DELETED_PRODUCTS_KEY, JSON.stringify(deletedIds));
  } catch {
    // ignore
  }

  const current = getLocalProducts();
  const idx = current.findIndex(p => p.id === normalized.id);
  if (idx >= 0) {
    current[idx] = normalized;
  } else {
    current.unshift(normalized);
  }
  saveLocalProducts(current);
}

// Delete Product
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
  }

  addDeletedProductId(productId);
  const current = getLocalProducts().filter(p => p.id !== productId);
  saveLocalProducts(current);
}

// Subscribe to Store Settings
export function subscribeToStoreSettings(
  onUpdate: (settings: StoreSettings) => void
): Unsubscribe {
  const unsubscribe = onSnapshot(
    doc(db, 'storeSettings', 'main'),
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as StoreSettings;
        if (!data.address || !data.address.includes('Bir Mourad')) {
          const normalized = normalizeStoreSettings(data);
          onUpdate(normalized);
          saveLocalStoreSettings(normalized);
          return;
        }
      }
      try {
        await setDoc(doc(db, 'storeSettings', 'main'), DEFAULT_STORE_SETTINGS);
      } catch {
        // ignore
      }
      onUpdate(DEFAULT_STORE_SETTINGS);
      saveLocalStoreSettings(DEFAULT_STORE_SETTINGS);
    },
    (error) => {
      console.warn("Error reading store settings, using local fallback:", error);
      onUpdate(getLocalStoreSettings());
    }
  );

  return unsubscribe;
}

// Save Store Settings
export async function saveStoreSettingsToFirestore(settings: StoreSettings): Promise<void> {
  const normalized = normalizeStoreSettings(settings);
  const payloadSize = new Blob([JSON.stringify(normalized)]).size;
  if (payloadSize > 950_000) {
    throw new Error('DOCUMENT_TOO_LARGE: Les images d\'arrière-plan sont trop volumineuses pour la base de données (limite 1 Mo).');
  }
  try {
    await setDoc(doc(db, 'storeSettings', 'main'), normalized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'storeSettings/main');
  }
  saveLocalStoreSettings(normalized);
}

// LocalStorage cache key for Lookbooks
const LOCAL_LOOKBOOKS_KEY = 'decor_home_lookbooks_v1';
const LOCAL_DELETED_LOOKBOOKS_KEY = 'decor_home_deleted_lookbooks_v1';
const LOCAL_LOOKBOOKS_INIT_KEY = 'decor_home_lookbooks_initialized_v1';

export function getDeletedLookbookIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_DELETED_LOOKBOOKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

export function addDeletedLookbookId(id: string): void {
  try {
    const current = getDeletedLookbookIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(LOCAL_DELETED_LOOKBOOKS_KEY, JSON.stringify(current));
    }
  } catch {
    // ignore
  }
}

function normalizeLookbook(scene: LookbookScene): LookbookScene {
  return {
    ...scene,
    image: normalizeAssetUrl(scene.image)
  };
}

export function getLocalLookbooks(): LookbookScene[] {
  const deletedIds = getDeletedLookbookIds();
  try {
    const raw = localStorage.getItem(LOCAL_LOOKBOOKS_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter(s => !deletedIds.includes(s.id)).map(normalizeLookbook);
      }
    }
  } catch {
    // ignore
  }
  return LOOKBOOK_SCENES.filter(s => !deletedIds.includes(s.id));
}

export function saveLocalLookbooks(scenes: LookbookScene[]): void {
  const deletedIds = getDeletedLookbookIds();
  const filtered = scenes.filter(s => !deletedIds.includes(s.id)).map(normalizeLookbook);
  try {
    localStorage.setItem(LOCAL_LOOKBOOKS_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

// Subscribe to Lookbooks in Firestore
export function subscribeToLookbooks(
  onUpdate: (scenes: LookbookScene[]) => void
): Unsubscribe {
  const colPath = 'lookbooks';
  let hasReceivedSnapshot = false;

  const unsubscribe = onSnapshot(
    collection(db, colPath),
    async (snapshot) => {
      hasReceivedSnapshot = true;
      const deletedIds = getDeletedLookbookIds();
      const hasInitialized = localStorage.getItem(LOCAL_LOOKBOOKS_INIT_KEY) === 'true';

      if (snapshot.empty) {
        if (!hasInitialized) {
          localStorage.setItem(LOCAL_LOOKBOOKS_INIT_KEY, 'true');
          const seedItems = LOOKBOOK_SCENES.filter(s => !deletedIds.includes(s.id));
          try {
            for (const item of seedItems) {
              await setDoc(doc(db, colPath, item.id), item);
            }
          } catch (e) {
            console.warn("Could not seed lookbooks in firestore:", e);
          }
          onUpdate(seedItems);
          saveLocalLookbooks(seedItems);
        } else {
          // If already initialized and empty, owner intentionally deleted all lookbooks
          onUpdate([]);
          saveLocalLookbooks([]);
        }
      } else {
        localStorage.setItem(LOCAL_LOOKBOOKS_INIT_KEY, 'true');
        const loaded: LookbookScene[] = [];
        snapshot.forEach((d) => {
          if (!deletedIds.includes(d.id)) {
            loaded.push(normalizeLookbook({ id: d.id, ...d.data() } as LookbookScene));
          } else {
            // Clean up from Firestore if it was deleted
            deleteDoc(doc(db, colPath, d.id)).catch(() => {});
          }
        });
        onUpdate(loaded);
        saveLocalLookbooks(loaded);
      }
    },
    (error) => {
      console.warn("Firestore lookbooks error, falling back to local storage:", error);
      if (!hasReceivedSnapshot) {
        onUpdate(getLocalLookbooks());
      }
    }
  );

  return unsubscribe;
}

// Save or Update Lookbook
export async function saveLookbookToFirestore(scene: LookbookScene): Promise<void> {
  const normalized = normalizeLookbook(scene);
  const payloadSize = new Blob([JSON.stringify(normalized)]).size;
  if (payloadSize > 950_000) {
    throw new Error('DOCUMENT_TOO_LARGE: La photo de ce lookbook est trop volumineuse (limite 1 Mo).');
  }

  try {
    await setDoc(doc(db, 'lookbooks', normalized.id), normalized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `lookbooks/${normalized.id}`);
  }

  // If re-saving a previously deleted ID, remove it from deleted blacklist
  try {
    const deletedIds = getDeletedLookbookIds().filter(id => id !== normalized.id);
    localStorage.setItem(LOCAL_DELETED_LOOKBOOKS_KEY, JSON.stringify(deletedIds));
  } catch {
    // ignore
  }

  const current = getLocalLookbooks();
  const idx = current.findIndex(s => s.id === normalized.id);
  if (idx >= 0) {
    current[idx] = normalized;
  } else {
    current.push(normalized);
  }
  saveLocalLookbooks(current);
}

// Delete Lookbook
export async function deleteLookbookFromFirestore(sceneId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'lookbooks', sceneId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `lookbooks/${sceneId}`);
  }

  addDeletedLookbookId(sceneId);
  const current = getLocalLookbooks().filter(s => s.id !== sceneId);
  saveLocalLookbooks(current);
}

// Reset Catalog and Lookbooks to initial items
export async function resetCatalogToDefault(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_DELETED_PRODUCTS_KEY);
    localStorage.removeItem(LOCAL_DELETED_LOOKBOOKS_KEY);
    localStorage.removeItem(LOCAL_PRODUCTS_INIT_KEY);
    localStorage.removeItem(LOCAL_LOOKBOOKS_INIT_KEY);
  } catch {
    // ignore
  }
  saveLocalProducts(INITIAL_PRODUCTS);
  saveLocalStoreSettings(DEFAULT_STORE_SETTINGS);
  saveLocalLookbooks(LOOKBOOK_SCENES);
  try {
    for (const item of INITIAL_PRODUCTS) {
      await setDoc(doc(db, 'products', item.id), item);
    }
    for (const scene of LOOKBOOK_SCENES) {
      await setDoc(doc(db, 'lookbooks', scene.id), scene);
    }
    await setDoc(doc(db, 'storeSettings', 'main'), DEFAULT_STORE_SETTINGS);
  } catch (e) {
    console.warn("Could not reset on remote firestore:", e);
  }
}

