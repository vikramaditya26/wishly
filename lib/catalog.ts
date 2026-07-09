// ---------------------------------------------------------------------------
// Wishly wedding registry catalog. Everything here is something a couple needs
// FOR the wedding or for married life after it - grouped into shelves. Photos
// come from cdn.dummyjson.com (free, stable product-image CDN). "Buy" points
// at an affiliate-tagged amazon.in search so listings never go stale.
// ---------------------------------------------------------------------------

import type { CatalogProduct } from "./types";

export const CATEGORIES: { id: string; label: string; blurb: string }[] = [
  { id: "home", label: "Home & Furniture", blurb: "The big pieces for a new home together" },
  { id: "decor", label: "Decor & Lighting", blurb: "Warm the new nest" },
  { id: "kitchen", label: "Kitchen & Dining", blurb: "For the first meals as a family" },
  { id: "couple", label: "For the Couple", blurb: "Watches, scents & keepsakes" },
  { id: "honeymoon", label: "Honeymoon & Tech", blurb: "For the journey ahead" },
];

// Invitation templates. `deep` drives the guest-page ribbon, names and accents;
// `hero` is the background photo on the couple's shared invitation page.
export const TEMPLATES: {
  id: string;
  label: string;
  deep: string;
  bg: string;
  tile: string;
  hero: string;
}[] = [
  { id: "royal", label: "Royal Maroon", deep: "#7c1d2b", bg: "#fbf1ea", tile: "#f2e3d2", hero: "/wedding/couple-gold.jpg" },
  { id: "marigold", label: "Marigold", deep: "#b3721b", bg: "#fdf3e0", tile: "#f6e6c8", hero: "/wedding/pheras.jpg" },
  { id: "rose", label: "Rose Petals", deep: "#b64760", bg: "#fceef1", tile: "#f6dbe1", hero: "/wedding/hero-petals.jpg" },
  { id: "classic", label: "Classic Ivory", deep: "#8a7a53", bg: "#f8f5ee", tile: "#ece5d5", hero: "/wedding/silhouette.jpg" },
  { id: "mehndi", label: "Mehndi Green", deep: "#5f7a4b", bg: "#f2f5ea", tile: "#e4ecd4", hero: "/wedding/agni.jpg" },
];

const CDN = "https://cdn.dummyjson.com/product-images";

function p(id: string, name: string, imagePath: string, category: string, amazonQuery?: string): CatalogProduct {
  return {
    id,
    name,
    image: `${CDN}/${imagePath}/thumbnail.webp`,
    category,
    amazonQuery: amazonQuery ?? name,
  };
}

export const PRODUCTS: CatalogProduct[] = [
  // ----------------------------- home & furniture --------------------------
  p("w1", "Upholstered Bed", "furniture/annibale-colombo-bed", "home", "upholstered double bed"),
  p("w2", "3-Seater Sofa", "furniture/annibale-colombo-sofa", "home", "3 seater sofa set"),
  p("w3", "Wooden Bedside Table", "furniture/bedside-table-african-cherry", "home", "wooden bedside table"),
  p("w4", "Accent Armchair", "furniture/knoll-saarinen-executive-conference-chair", "home", "accent armchair"),
  p("w5", "Vanity with Mirror", "furniture/wooden-bathroom-sink-with-mirror", "home", "dressing table with mirror"),
  p("w6", "Hanging Swing Chair", "home-decoration/decoration-swing", "home", "indoor hanging swing chair"),

  // ----------------------------- decor & lighting --------------------------
  p("w7", "Table Lamp Pair", "home-decoration/table-lamp", "decor", "table lamp set of 2"),
  p("w8", "Family Photo Frames", "home-decoration/family-tree-photo-frame", "decor", "wall photo frame set"),
  p("w9", "Decorative Plant", "home-decoration/house-showpiece-plant", "decor", "artificial decor plant"),
  p("w10", "Ceramic Planter", "home-decoration/plant-pot", "decor", "ceramic planter pot"),
  p("w11", "Aroma Diffuser", "fragrances/dolce-shine-eau-de", "decor", "reed diffuser home fragrance"),

  // ----------------------------- kitchen & dining --------------------------
  p("w12", "Microwave Oven", "kitchen-accessories/microwave-oven", "kitchen", "microwave oven"),
  p("w13", "Mixer & Blender", "kitchen-accessories/boxed-blender", "kitchen", "mixer grinder blender"),
  p("w14", "Steel Cook Pot Set", "kitchen-accessories/silver-pot-with-glass-cap", "kitchen", "stainless steel cookware set"),
  p("w15", "Non-stick Pan Set", "kitchen-accessories/pan", "kitchen", "non stick pan set"),
  p("w16", "Wooden Chopping Board", "kitchen-accessories/chopping-board", "kitchen", "wooden chopping board set"),
  p("w17", "Mug Tree & Cups", "kitchen-accessories/mug-tree-stand", "kitchen", "coffee mug set with stand"),
  p("w18", "Masala & Spice Rack", "kitchen-accessories/spice-rack", "kitchen", "masala spice rack organiser"),
  p("w19", "Serving Tray Set", "kitchen-accessories/tray", "kitchen", "serving tray set"),

  // ------------------------------- for the couple --------------------------
  p("w20", "His Classic Watch", "mens-watches/brown-leather-belt-watch", "couple", "men leather strap watch"),
  p("w21", "His Steel Watch", "mens-watches/rolex-datejust", "couple", "men steel analog watch"),
  p("w22", "Her Gold Watch", "womens-watches/watch-gold-for-women", "couple", "gold watch for women"),
  p("w23", "Her Silver Watch", "womens-watches/iwc-ingenieur-automatic-steel", "couple", "women silver watch"),
  p("w24", "His Perfume", "fragrances/calvin-klein-ck-one", "couple", "perfume for men"),
  p("w25", "Her Perfume", "fragrances/gucci-bloom-eau-de", "couple", "perfume for women"),
  p("w26", "Bridal Earrings", "womens-jewellery/green-crystal-earring", "couple", "bridal earrings set"),
  p("w27", "Evening Clutch", "womens-bags/prada-women-bag", "couple", "designer clutch bag women"),

  // ----------------------------- honeymoon & tech --------------------------
  p("w28", "Smartphone", "smartphones/iphone-6", "honeymoon", "smartphone"),
  p("w29", "Tablet", "tablets/ipad-mini-2021-starlight", "honeymoon", "tablet"),
  p("w30", "Laptop", "laptops/apple-macbook-pro-14-inch-space-grey", "honeymoon", "laptop"),
  p("w31", "Wireless Earbuds", "mobile-accessories/apple-airpods", "honeymoon", "wireless earbuds"),
  p("w32", "Over-ear Headphones", "mobile-accessories/apple-airpods-max-silver", "honeymoon", "over ear headphones"),
  p("w33", "Smart Speaker", "mobile-accessories/amazon-echo-plus", "honeymoon", "smart speaker"),
  p("w34", "Travel Sunglasses", "sunglasses/black-sun-glasses", "honeymoon", "polarized sunglasses"),
  p("w35", "Weekender Bag", "womens-bags/white-faux-leather-backpack", "honeymoon", "travel weekender bag"),
];

// Wedding-planning resources shown on the home page. Templates are internal
// links; the checklists open helpful Google searches for now (real downloadable
// PDFs can replace these later).
export const RESOURCES: { title: string; blurb: string; href: string; kind: string }[] = [
  {
    title: "Invitation templates",
    blurb: "Pick a look for your shared invite — Royal, Marigold, Rose & more.",
    href: "#templates",
    kind: "Templates",
  },
  {
    title: "Wedding gift checklist",
    blurb: "The essentials every new home needs, room by room.",
    href: "https://www.google.com/search?q=wedding+registry+gift+checklist+india",
    kind: "Checklist",
  },
  {
    title: "Planning timeline",
    blurb: "A simple month-by-month countdown to the big day.",
    href: "https://www.google.com/search?q=indian+wedding+planning+timeline+checklist",
    kind: "Guide",
  },
  {
    title: "Budget planner",
    blurb: "Keep track of who's covering what, stress-free.",
    href: "https://www.google.com/search?q=indian+wedding+budget+planner+template",
    kind: "Planner",
  },
];
