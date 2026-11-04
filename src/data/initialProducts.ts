import { Product, LookbookScene, StoreSettings } from '../types';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Décor Home',
  tagline: "L'Art de Vivre & Décoration d'Intérieur Haut de Gamme",
  phone: '+213 550 12 34 56',
  whatsappNumber: '213550123456',
  whatsappPreFilledMessage: 'Bonjour Décor Home, je souhaite des renseignements sur vos collections de décoration.',
  instagramUrl: 'https://instagram.com/decorhome_bejaia',
  tiktokUrl: 'https://tiktok.com/@decorhome_dz',
  address: 'Cité Djama Bâtiment D',
  city: 'Béjaïa, Algérie',
  hoursWeekday: 'Lundi au Samedi : 10h00 – 19h30',
  hoursWeekend: 'Vendredi : 15h00 – 20h00 · Dimanche : Fermé',
  googleMapsUrl: 'https://maps.app.goo.gl/Hprk7FDSz44Mxfpk9'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'dh-lum-01',
    title: 'Lampadaire Sculptural en Plâtre Minéral "Lumen Arch"',
    category: 'luminaires',
    price: 48000,
    currency: 'DZD',
    dimensions: 'H 175 cm × L 52 cm × P 40 cm',
    material: 'Plâtre texturé blanc cassé, structure acier tubulaire, diffuseur LED chaud 2700K',
    description: "Véritable sculpture lumineuse façonnée à la main. Sa silhouette organique inspirée des arches méditerranéennes projette une lumière douce et enveloppante, idéale en pièce maîtresse de salon.",
    badge: 'coup-de-coeur',
    inStock: true,
    reference: 'DH-LUM-01',
    images: [
      '/src/assets/images/hero_decor_home_salon_1793732697943.jpg',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
    ],
    instagramReelUrl: 'https://instagram.com/reel/decorhome_lumen_arch',
    tiktokVideoUrl: 'https://tiktok.com/@decorhome_dz/video/lumen_arch',
    featured: true
  },
  {
    id: 'dh-meub-01',
    title: 'Canapé Organique Bouclé Écru "Palma"',
    category: 'meubles-appoint',
    price: 245000,
    currency: 'DZD',
    dimensions: 'L 240 cm × P 105 cm × H 72 cm (Assise: 42 cm)',
    material: 'Laine bouclée texturée écru traitement anti-tâche, structure hêtre massif FSC, mousse haute résilience 38 kg/m³',
    description: "Lignes courbées sensuelles et confort d'assise incomparable. Sa matière bouclée noble apporte une texture cocooning et sophistiquée à tout intérieur contemporain.",
    badge: 'exclusivite',
    inStock: true,
    reference: 'DH-MEUB-01',
    images: [
      '/src/assets/images/hero_decor_home_salon_1793732697943.jpg',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80'
    ],
    instagramReelUrl: 'https://instagram.com/reel/decorhome_canape_palma',
    featured: true
  },
  {
    id: 'dh-meub-02',
    title: 'Table Basse en Travertin Massif "Roma Block"',
    category: 'meubles-appoint',
    price: 92000,
    currency: 'DZD',
    dimensions: 'L 130 cm × l 65 cm × H 36 cm',
    material: 'Travertin beige naturel non rebouché, finition adoucie mate, pieds monolithes',
    description: "Façonnée dans un travertin naturel d'exception aux veinures uniques. Son profil architectural bas ancre le salon dans une élégance minérale intemporelle.",
    badge: 'coup-de-coeur',
    inStock: true,
    reference: 'DH-MEUB-02',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true
  },
  {
    id: 'dh-mir-01',
    title: 'Miroir Mural Organique en Laiton Martelé "Onde"',
    category: 'miroirs',
    price: 36000,
    currency: 'DZD',
    dimensions: 'H 110 cm × L 85 cm × P 3.5 cm',
    material: 'Cadre laiton massif martelé à la main, miroir sans cuivre 5 mm haute réflexion',
    description: "Contours fluides et asymétriques inspirés des galets de rivière. La patine dorée brossée reflète délicatement la lumière naturelle et agrandit l'espace d'une entrée ou d'un salon.",
    badge: 'nouveaute',
    inStock: true,
    reference: 'DH-MIR-01',
    images: [
      '/src/assets/images/lookbook_entree_epuree_1793732699251.jpg',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80'
    ],
    instagramReelUrl: 'https://instagram.com/reel/decorhome_miroir_onde',
    tiktokVideoUrl: 'https://tiktok.com/@decorhome_dz/video/miroir_onde',
    featured: true
  },
  {
    id: 'dh-vas-01',
    title: 'Vase Amphore Artisanale en Terre Cuite Chamottée "Atlas"',
    category: 'vases-ceramiques',
    price: 18500,
    currency: 'DZD',
    dimensions: 'H 48 cm × Ø 32 cm',
    material: 'Terre cuite chamottée patinée à la chaux, deux anses sculptées, étanche',
    description: "Inspiré des poteries vernaculaires d'Afrique du Nord. Sa surface texturée et rugueuse met en valeur de grandes branches d'olivier ou d'eucalyptus séchées.",
    badge: 'coup-de-coeur',
    inStock: true,
    reference: 'DH-VAS-01',
    images: [
      '/src/assets/images/lookbook_entree_epuree_1793732699251.jpg',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true
  },
  {
    id: 'dh-meub-03',
    title: 'Console Minimaliste en Travertin "Altos"',
    category: 'meubles-appoint',
    price: 78000,
    currency: 'DZD',
    dimensions: 'L 120 cm × P 38 cm × H 82 cm',
    material: 'Pierre de travertin beige claire adoucie, montage à onglet invisible',
    description: "Une silhouette d'une grande pureté architecturale conçue pour habiller une entrée ou un corridor avec distinction et légèreté.",
    badge: 'exclusivite',
    inStock: true,
    reference: 'DH-MEUB-03',
    images: [
      '/src/assets/images/lookbook_entree_epuree_1793732699251.jpg',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-lum-02',
    title: 'Suspension Lustre Boules de Verre Fumé "Cosmos 12"',
    category: 'luminaires',
    price: 64000,
    currency: 'DZD',
    dimensions: 'Ø 85 cm × H réglable 60-140 cm (12 sphères)',
    material: 'Verre soufflé bouche teinté ambré fumé, bras en laiton doré brossé satiné',
    description: "Une constellation aérienne qui apporte un cachet grandiose au-dessus d'une grande table de salle à manger. Les globes fumés diffusent une douce lueur dorée sans éblouir.",
    badge: 'coup-de-coeur',
    inStock: true,
    reference: 'DH-LUM-02',
    images: [
      '/src/assets/images/lookbook_salle_manger_1793732699636.jpg',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80'
    ],
    instagramReelUrl: 'https://instagram.com/reel/decorhome_lustre_cosmos'
  },
  {
    id: 'dh-meub-04',
    title: 'Table de Repas Ronde en Chêne Massif Cannelé "Kyoto"',
    category: 'meubles-appoint',
    price: 185000,
    currency: 'DZD',
    dimensions: 'Ø 150 cm × H 76 cm (Capacité 6-8 personnes)',
    material: 'Chêne massif européen huilé naturel, piétement central cylindrique cannelé',
    description: "La convivialité par excellence. Son piétement central libère totalement l'espace pour les convives, tandis que le travail d'ébénisterie cannelé attire tous les regards.",
    badge: 'exclusivite',
    inStock: true,
    reference: 'DH-MEUB-04',
    images: [
      '/src/assets/images/lookbook_salle_manger_1793732699636.jpg',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-art-01',
    title: 'Vase Sculpture en Céramique Grès Texturé "Vesta"',
    category: 'vases-ceramiques',
    price: 16500,
    currency: 'DZD',
    dimensions: 'H 38 cm × L 30 cm × P 18 cm',
    material: 'Grès chamotté beige naturel, double anse architecturée, fabrication au tour',
    description: "Sculpté à la manière d'une œuvre d'art moderne. Parfait en pièce centrale sur une table ou sur un buffet bas en bois.",
    badge: 'nouveaute',
    inStock: true,
    reference: 'DH-VAS-02',
    images: [
      '/src/assets/images/lookbook_salle_manger_1793732699636.jpg',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-meub-05',
    title: 'Fauteuil Crapaud en Velours Côtelé Cognac "Auguste"',
    category: 'meubles-appoint',
    price: 68000,
    currency: 'DZD',
    dimensions: 'L 84 cm × P 88 cm × H 86 cm',
    material: 'Velours de coton côtelé coloris ambré cognac, pieds en noyer massif teinté foncé',
    description: "Une silhouette club rétro revisitée pour les intérieurs parisiens chaleureux. Assise enveloppante invitant aux longues heures de lecture avec un bon livre.",
    badge: 'coup-de-coeur',
    inStock: true,
    reference: 'DH-MEUB-05',
    images: [
      '/src/assets/images/lookbook_coin_lecture_1793732699005.jpg',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80'
    ],
    instagramReelUrl: 'https://instagram.com/reel/decorhome_fauteuil_auguste'
  },
  {
    id: 'dh-lum-03',
    title: 'Liseuse Orientable Laiton & Marbre "Artisan Studio"',
    category: 'luminaires',
    price: 32000,
    currency: 'DZD',
    dimensions: 'H 145 cm × Envergure 60 cm, Socle Ø 25 cm',
    material: 'Laiton brossé verni satiné, socle en marbre Marquina noir massif',
    description: "Finesse chirurgicale et rotule orientable à 360°. Conçue pour accompagner élégamment un fauteuil de lecture ou un coin bureau raffiné.",
    badge: 'nouveaute',
    inStock: true,
    reference: 'DH-LUM-03',
    images: [
      '/src/assets/images/lookbook_coin_lecture_1793732699005.jpg',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-meub-06',
    title: 'Enfilade Basse Japandi Portes Cannelées "Nara"',
    category: 'meubles-appoint',
    price: 135000,
    currency: 'DZD',
    dimensions: 'L 190 cm × P 45 cm × H 68 cm',
    material: 'Chêne clair massif et placage chêne de fil, 4 portes coulissantes cannelées',
    description: "L'art de l'épure japonaise combiné au savoir-faire d'ébénisterie scandinave. Grands volumes de rangement dissimulés derrière un relief rythmé.",
    badge: 'coup-de-coeur',
    inStock: true,
    reference: 'DH-MEUB-06',
    images: [
      '/src/assets/images/lookbook_salon_japandi_1793732698392.jpg',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-tap-01',
    title: 'Tapis Tisage Artisanal Jute & Laine Écrue "Nomade"',
    category: 'tapis-textiles',
    price: 45000,
    currency: 'DZD',
    dimensions: '200 cm × 290 cm',
    material: '60% jute brute naturelle lavée, 40% pure laine de Nouvelle-Zélande',
    description: "Tissé à la main sur métier traditionnel. Son mélange unique de fibres naturelles apporte chaleur au sol sans compromettre la résistance dans le temps.",
    badge: 'aucun',
    inStock: true,
    reference: 'DH-TAP-01',
    images: [
      '/src/assets/images/lookbook_salon_japandi_1793732698392.jpg',
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-mur-01',
    title: 'Tableau Relief Texturé Plâtre Minéral "Silence Blanc"',
    category: 'decoration-murale',
    price: 28000,
    currency: 'DZD',
    dimensions: '90 cm × 120 cm × Épaisseur 4 cm',
    material: 'Enduit de chaux et sables fins sur châssis lin naturel, encadrement chêne brut',
    description: "Œuvre murale minimaliste jouant avec les ombres portées selon les heures du jour. Chaque exemplaire est texturé individuellement par nos artisans créateurs.",
    badge: 'nouveaute',
    inStock: true,
    reference: 'DH-MUR-01',
    images: [
      '/src/assets/images/lookbook_salon_japandi_1793732698392.jpg',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80'
    ],
    instagramReelUrl: 'https://instagram.com/reel/decorhome_tableau_silence'
  },
  {
    id: 'dh-art-02',
    title: 'Service de 6 Assiettes Céramique Organique "Terre Brune"',
    category: 'arts-de-la-table',
    price: 22000,
    currency: 'DZD',
    dimensions: 'Ø 27 cm chacune (Lot de 6 pièces)',
    material: 'Grès émaillé beige réactif, bords chantournés irréguliers, compatible lave-vaisselle',
    description: "Chaque pièce présente des nuances subtiles issues de la cuisson au four à haute température. Donnez à votre table de fête une âme poétique et authentique.",
    badge: 'aucun',
    inStock: true,
    reference: 'DH-TBL-01',
    images: [
      'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-art-03',
    title: 'Carafe & Verres Cannelés Soufflés Bouche "Riviera"',
    category: 'arts-de-la-table',
    price: 15500,
    currency: 'DZD',
    dimensions: 'Carafe 1.2 L (H 24 cm) + 4 Gobelets 35 cl',
    material: 'Verre borosilicate soufflé bouche résistant aux chocs thermiques',
    description: "Texture côtelée iconique des tables méditerranéennes. Idéal pour servir vos eaux aromatisées fraîches ou vos grands crus avec légèreté.",
    badge: 'nouveaute',
    inStock: true,
    reference: 'DH-TBL-02',
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-mir-02',
    title: 'Miroir Plein Pied en Bois de Manguier Massif "Archeo"',
    category: 'miroirs',
    price: 52000,
    currency: 'DZD',
    dimensions: 'H 185 cm × L 75 cm × P 5 cm',
    material: 'Manguier massif certifié finition noyer patiné à la cire, dos renforcé',
    description: "Sommet en plein cintre majestueux. Se pose directement contre un mur de chambre à coucher ou dans un dressing pour un reflet impeccable de la tête aux pieds.",
    badge: 'coup-de-coeur',
    inStock: true,
    reference: 'DH-MIR-02',
    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'
    ],
    tiktokVideoUrl: 'https://tiktok.com/@decorhome_dz/video/archeo_miroir'
  },
  {
    id: 'dh-tap-02',
    title: 'Plaid Frangé en Pure Laine d\'Alpaga "Andes Ecru"',
    category: 'tapis-textiles',
    price: 19500,
    currency: 'DZD',
    dimensions: '140 cm × 200 cm',
    material: '100% laine d\'alpaga naturelle non teinte, franges torsadées nouées main',
    description: "Une douceur inégalée et une légèreté surprenante. Déposé délicatement sur le bras d'un canapé ou au pied d'un lit, il réchauffe instantanément l'atmosphère.",
    badge: 'aucun',
    inStock: true,
    reference: 'DH-TEX-01',
    images: [
      '/src/assets/images/lookbook_coin_lecture_1793732699005.jpg',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-mur-02',
    title: 'Panier Mural Tissé Traditionnel Fibres de Palmier "Sahel"',
    category: 'decoration-murale',
    price: 11000,
    currency: 'DZD',
    dimensions: 'Ø 60 cm × Profondeur 8 cm',
    material: 'Fibres végétales de palmier doum et raphia naturel tressé serré',
    description: "Confection artisanale ancestrale. À suspendre seul en élément fort ou en composition triptyque au-dessus d'une commode ou d'une tête de lit.",
    badge: 'aucun',
    inStock: false,
    reference: 'DH-MUR-02',
    images: [
      'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'dh-vas-03',
    title: 'Soliflore Sculptural en Grès Brut "Galet Zen"',
    category: 'vases-ceramiques',
    price: 8500,
    currency: 'DZD',
    dimensions: 'H 22 cm × L 18 cm × P 9 cm',
    material: 'Grès chamotté anthracite brut mat, intérieur vitrifié étanche',
    description: "Un hommage au minimalisme wabi-sabi. Une seule branche d'hortensia séchée ou une fleur fraîche suffit pour créer un tableau zen fascinant.",
    badge: 'nouveaute',
    inStock: true,
    reference: 'DH-VAS-03',
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=80'
    ]
  }
];

export const LOOKBOOK_SCENES: LookbookScene[] = [
  {
    id: 'scene-salon-japandi',
    title: 'Salon Japandi & Matières Vivantes',
    subtitle: 'Équilibre entre minimalisme nordique et sérénité japonaise',
    description: 'Une composition apaisante qui met à l’honneur le chêne cannelé, la céramique artisanale et les textures minérales pour créer un sanctuaire chaleureux.',
    image: '/src/assets/images/lookbook_salon_japandi_1793732698392.jpg',
    productIds: ['dh-meub-06', 'dh-tap-01', 'dh-mur-01', 'dh-vas-03'],
    hotspots: [
      { id: 'hs-1', x: 50, y: 64, productId: 'dh-meub-06', label: 'Enfilade Cannelée Nara' },
      { id: 'hs-2', x: 33, y: 50, productId: 'dh-vas-03', label: 'Vase Céramique Minérale' },
      { id: 'hs-3', x: 73, y: 29, productId: 'dh-mur-01', label: 'Tableau Relief Silence Blanc' },
      { id: 'hs-4', x: 45, y: 88, productId: 'dh-tap-01', label: 'Tapis Jute & Laine Nomade' }
    ]
  },
  {
    id: 'scene-coin-lecture',
    title: 'Le Coin Lecture & Velours Cognac',
    subtitle: 'Une atmosphère feutrée digne des grands appartements d’auteurs',
    description: 'Associez la chaleur du velours ambré au reflet noble du laiton brossé pour faire de votre instant lecture un rituel d’exception.',
    image: '/src/assets/images/lookbook_coin_lecture_1793732699005.jpg',
    productIds: ['dh-meub-05', 'dh-lum-03', 'dh-tap-02'],
    hotspots: [
      { id: 'hs-5', x: 62, y: 65, productId: 'dh-meub-05', label: 'Fauteuil Velours Auguste' },
      { id: 'hs-6', x: 56, y: 35, productId: 'dh-lum-03', label: 'Liseuse Laiton Artisan Studio' },
      { id: 'hs-7', x: 65, y: 76, productId: 'dh-tap-02', label: 'Plaid Frangé en Pure Laine' }
    ]
  },
  {
    id: 'scene-salle-manger',
    title: 'La Salle à Manger Réception & Verre Fumé',
    subtitle: 'La convivialité sublimée par l’artisanat d’art',
    description: 'Au cœur de la pièce, la table ronde en chêne massif cannelé dialogue avec le lustre monumental aux 12 sphères de verre soufflé fumé.',
    image: '/src/assets/images/lookbook_salle_manger_1793732699636.jpg',
    productIds: ['dh-lum-02', 'dh-meub-04', 'dh-art-01'],
    hotspots: [
      { id: 'hs-8', x: 50, y: 18, productId: 'dh-lum-02', label: 'Lustre Boules Verre Cosmos 12' },
      { id: 'hs-9', x: 50, y: 72, productId: 'dh-meub-04', label: 'Table Ronde Chêne Kyoto' },
      { id: 'hs-10', x: 50, y: 56, productId: 'dh-art-01', label: 'Vase Sculpture Vesta' }
    ]
  },
  {
    id: 'scene-entree',
    title: 'L’Entrée Minérale & Miroir Organique',
    subtitle: 'Première impression inoubliable dès le seuil franchi',
    description: 'Une console monobloc en travertin romain associée au grand miroir ondulé en laiton pour capter la lumière et donner le ton du raffinement.',
    image: '/src/assets/images/lookbook_entree_epuree_1793732699251.jpg',
    productIds: ['dh-mir-01', 'dh-meub-03', 'dh-vas-01'],
    hotspots: [
      { id: 'hs-11', x: 58, y: 32, productId: 'dh-mir-01', label: 'Miroir Organique Onde' },
      { id: 'hs-12', x: 54, y: 82, productId: 'dh-meub-03', label: 'Console Travertin Altos' },
      { id: 'hs-13', x: 74, y: 64, productId: 'dh-vas-01', label: 'Vase Amphore Atlas' }
    ]
  }
];
