// Shared types used across the app.

export type Occasion =
  | "birthday"
  | "wedding"
  | "anniversary"
  | "housewarming"
  | "baby"
  | "justbecause";

export type ForWho = "her" | "him" | "kids" | "couple" | "anyone";

export type Vibe = "student" | "working" | "any";

export interface CatalogProduct {
  id: string;
  name: string;
  emoji: string;
  price: string; // display-only range, e.g. "₹299 – ₹799"
  category: string; // category id from CATEGORIES
  amazonQuery: string; // used to build an affiliate-tagged amazon.in search link
  occasions: Occasion[];
  forWho: ForWho[];
  vibe: Vibe;
}

export interface BasketItem {
  id: string;
  name: string;
  emoji?: string;
  imageUrl?: string; // only for custom (user-added) products
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
