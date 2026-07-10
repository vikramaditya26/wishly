// Shared types. Wishly is now a wedding gift-registry product, so a "basket"
// is a couple's wedding wishlist.

export interface CatalogProduct {
  id: string;
  name: string;
  image: string; // product photo URL
  category: string; // category id from CATEGORIES
  amazonQuery: string; // used to build an affiliate-tagged amazon.in search link
  buyUrl?: string; // an explicit product link; overrides the search link
}

// A curated gift the site owner adds from the admin panel (stored in the DB
// and shown to everyone, alongside the built-in CatalogProduct list).
export interface AdminItem {
  id: string;
  category: string;
  name: string;
  imageUrl?: string;
  buyUrl?: string;
}

export interface BasketItem {
  id: string;
  name: string;
  imageUrl?: string;
  url?: string; // buy link; affiliate tag is added automatically for amazon links
  claimedBy?: string | null;
}

export interface Basket {
  shareId: string;
  hostName: string; // partner one
  partnerTwo?: string; // partner two
  venue?: string;
  message: string;
  theme: string; // invitation template id
  eventDate?: string;
  items: BasketItem[];
  createdAt: string;
}

// Basket + the secret only the couple should ever see.
export interface BasketWithSecret extends Basket {
  manageKey: string;
}
