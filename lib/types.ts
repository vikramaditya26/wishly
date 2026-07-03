// Shared types used across the app.

export type Occasion =
  | "birthday"
  | "wedding"
  | "anniversary"
  | "housewarming"
  | "justbecause";

export type ForWho = "her" | "him" | "anyone";

export interface CatalogProduct {
  id: string;
  name: string;
  image: string; // product photo URL
  price: number; // INR, display-only
  category: string; // category id from CATEGORIES
  amazonQuery: string; // used to build an affiliate-tagged amazon.in search link
  occasions: Occasion[];
  forWho: ForWho;
}

export interface BasketItem {
  id: string;
  name: string;
  emoji?: string; // legacy field, unused in UI
  imageUrl?: string;
  price?: string;
  url?: string; // buy link; affiliate tag is added automatically for amazon links
  claimedBy?: string | null;
}

export interface Basket {
  shareId: string;
  hostName: string;
  occasion: Occasion;
  message: string;
  theme: string;
  eventDate?: string;
  items: BasketItem[];
  createdAt: string;
}

// Basket + the secret only the creator should ever see.
export interface BasketWithSecret extends Basket {
  manageKey: string;
}
