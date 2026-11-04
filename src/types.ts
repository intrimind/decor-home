export type Category = 
  | 'tous'
  | 'luminaires'
  | 'miroirs'
  | 'vases-ceramiques'
  | 'meubles-appoint'
  | 'decoration-murale'
  | 'arts-de-la-table'
  | 'tapis-textiles';

export type BadgeType = 'nouveaute' | 'coup-de-coeur' | 'exclusivite' | 'aucun';

export interface Product {
  id: string;
  title: string;
  category: Category;
  price: number;
  currency: string;
  dimensions: string; // e.g. "H 145 cm × Ø 38 cm"
  material: string; // e.g. "Laiton massif brossé & albâtre véritable"
  description: string;
  badge: BadgeType;
  inStock: boolean;
  reference: string; // e.g. "DH-LUM-01"
  images: string[];
  instagramReelUrl?: string;
  tiktokVideoUrl?: string;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LookbookHotspot {
  id: string;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  productId: string;
  label: string;
}

export interface LookbookScene {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  hotspots: LookbookHotspot[];
  productIds: string[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  whatsappPreFilledMessage: string;
  instagramUrl: string;
  tiktokUrl: string;
  address: string;
  city: string;
  hoursWeekday: string;
  hoursWeekend: string;
  googleMapsUrl: string;
}
