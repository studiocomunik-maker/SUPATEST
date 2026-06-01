// ⚠️ Contenu en dur pour l'instant.
// PROCHAINE ÉTAPE SUPABASE : chaque tableau ci-dessous correspond à une future
// table (`featured_dishes`, `menu_items`…). On remplacera ces constantes par
// des `supabase.from(...).select()` sans rien changer à l'affichage.

export type Dish = {
  name: string;
  description: string;
  image: string;
};

export type MenuItem = {
  name: string;
  description: string;
  price: string;
  tag?: "Signature" | "Végétarien" | "De saison";
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

// Sections de la carte (ordre d'affichage) et tags disponibles.
// Partagés entre le front (affichage) et le back-office (formulaires).
export const MENU_SECTIONS = ["Entrées", "Plats", "Desserts"] as const;
export const MENU_TAGS = ["Signature", "Végétarien", "De saison"] as const;

export const restaurant = {
  name: "Maison Margaux",
  tagline: "Cuisine française d'actualité",
  baseline:
    "Une cuisine du marché, vive et de saison, dans un écrin de bistrot parisien.",
  address: "18 rue des Vinaigriers, 75010 Paris",
  phone: "01 42 00 18 18",
  hours: "Mardi – Samedi · 12h–14h30 & 19h–22h30",
};

// Section « Produits en avant » — plats signature mis en valeur
export const featuredDishes: Dish[] = [
  {
    name: "Le marché du jour",
    description:
      "Selon l'arrivage : poisson de ligne, légumes oubliés et jus court réduit au beurre demi-sel.",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Bœuf, sauce au poivre",
    description:
      "Pièce maturée 30 jours, pommes grenailles confites, sauce au poivre de Madagascar.",
    image:
      "https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Tarte fine, glace vanille",
    description:
      "Pâte feuilletée caramélisée, pommes du Limousin, glace vanille de Madagascar minute.",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
];

// Section « Menu »
export const menu: MenuSection[] = [
  {
    title: "Entrées",
    items: [
      {
        name: "Œuf parfait, crème de cèpes",
        description: "Cuit à 64°, mouillettes au comté, huile de noisette.",
        price: "14",
        tag: "Signature",
      },
      {
        name: "Velouté de potimarron",
        description: "Châtaignes torréfiées, chips de sauge, crème fouettée.",
        price: "12",
        tag: "Végétarien",
      },
      {
        name: "Tartare de bœuf au couteau",
        description: "Condiments maison, câpres, jaune d'œuf confit.",
        price: "16",
      },
    ],
  },
  {
    title: "Plats",
    items: [
      {
        name: "Suprême de volaille fermière",
        description: "Purée à la truffe, jus corsé à l'estragon.",
        price: "26",
        tag: "Signature",
      },
      {
        name: "Risotto de courge rôtie",
        description: "Parmesan 24 mois, noisettes, huile de sauge.",
        price: "22",
        tag: "Végétarien",
      },
      {
        name: "Cabillaud nacré",
        description: "Beurre blanc, poireaux fondants, citron confit.",
        price: "27",
        tag: "De saison",
      },
    ],
  },
  {
    title: "Desserts",
    items: [
      {
        name: "Paris-Brest",
        description: "Praliné noisette coulant, craquelin maison.",
        price: "11",
        tag: "Signature",
      },
      {
        name: "Tarte fine aux pommes",
        description: "Glace vanille de Madagascar, caramel au beurre salé.",
        price: "10",
      },
      {
        name: "Mousse au chocolat grand cru",
        description: "Fève de Saint-Domingue 72 %, fleur de sel.",
        price: "9",
      },
    ],
  },
];
