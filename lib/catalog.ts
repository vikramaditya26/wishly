// ---------------------------------------------------------------------------
// The curated gift catalog: 8 categories x 10 products, with real product
// photos (cdn.dummyjson.com - free, stable product-image CDN; replace with own
// images later if desired). Prices are indicative INR. "Buy" goes to an
// affiliate-tagged amazon.in search for the product name, so listings never
// go stale. To edit the catalog, edit this file - no database involved.
// ---------------------------------------------------------------------------

import type { CatalogProduct, ForWho, Occasion } from "./types";

export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "birthday", label: "Birthday" },
  { id: "wedding", label: "Wedding" },
  { id: "anniversary", label: "Anniversary" },
  { id: "housewarming", label: "Housewarming" },
  { id: "justbecause", label: "Just because" },
];

export const FOR_WHO: { id: ForWho; label: string }[] = [
  { id: "her", label: "For her" },
  { id: "him", label: "For him" },
];

export const CATEGORIES: { id: string; label: string }[] = [
  { id: "beauty", label: "Beauty & Fragrance" },
  { id: "watches", label: "Watches" },
  { id: "tech", label: "Tech" },
  { id: "fashion", label: "Clothing" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Bags & Jewellery" },
  { id: "home", label: "Home & Kitchen" },
  { id: "sports", label: "Sports" },
];

// Guest-page themes: quiet paper tints, not loud gradients.
export const THEMES: { id: string; label: string; bg: string; tile: string }[] = [
  { id: "ivory", label: "Ivory", bg: "#faf7f1", tile: "#f4efe6" },
  { id: "blush", label: "Blush", bg: "#f9f0ee", tile: "#f3e6e2" },
  { id: "sage", label: "Sage", bg: "#f1f4ee", tile: "#e9eee2" },
  { id: "sky", label: "Sky", bg: "#eff3f6", tile: "#e5ecf1" },
  { id: "lavender", label: "Lavender", bg: "#f2eff7", tile: "#eae5f2" },
];

const CDN = "https://cdn.dummyjson.com/product-images";

function p(
  id: string,
  name: string,
  imagePath: string,
  price: number,
  category: string,
  occasions: Occasion[],
  forWho: ForWho,
  amazonQuery?: string
): CatalogProduct {
  return {
    id,
    name,
    image: `${CDN}/${imagePath}/thumbnail.webp`,
    price,
    category,
    amazonQuery: amazonQuery ?? name,
    occasions,
    forWho,
  };
}

const BDAY: Occasion[] = ["birthday", "anniversary", "justbecause"];
const DRESSY: Occasion[] = ["birthday", "wedding", "anniversary"];
const CASUAL: Occasion[] = ["birthday", "justbecause"];
const HOMEY: Occasion[] = ["wedding", "housewarming", "anniversary"];

export const PRODUCTS: CatalogProduct[] = [
  // --------------------------- beauty & fragrance --------------------------
  p("g1", "Lash Princess Mascara", "beauty/essence-mascara-lash-princess", 499, "beauty", BDAY, "her", "essence lash princess mascara"),
  p("g2", "Eyeshadow Palette", "beauty/eyeshadow-palette-with-mirror", 899, "beauty", BDAY, "her", "eyeshadow palette with mirror"),
  p("g3", "Compact Face Powder", "beauty/powder-canister", 599, "beauty", BDAY, "her"),
  p("g4", "Classic Red Lipstick", "beauty/red-lipstick", 699, "beauty", BDAY, "her", "red lipstick matte"),
  p("g5", "Nail Polish Set", "beauty/red-nail-polish", 399, "beauty", CASUAL, "her", "nail polish set"),
  p("g6", "Calvin Klein CK One", "fragrances/calvin-klein-ck-one", 3499, "beauty", DRESSY, "anyone", "calvin klein ck one perfume"),
  p("g7", "Chanel Coco Noir", "fragrances/chanel-coco-noir-eau-de", 9999, "beauty", DRESSY, "her", "chanel coco noir perfume"),
  p("g8", "Dior J'adore", "fragrances/dior-j'adore", 8499, "beauty", DRESSY, "her", "dior jadore perfume"),
  p("g9", "Dolce & Gabbana Shine", "fragrances/dolce-shine-eau-de", 6999, "beauty", DRESSY, "her", "dolce gabbana perfume women"),
  p("g10", "Gucci Bloom", "fragrances/gucci-bloom-eau-de", 7499, "beauty", DRESSY, "her", "gucci bloom perfume"),

  // -------------------------------- watches --------------------------------
  p("g11", "Brown Leather Strap Watch", "mens-watches/brown-leather-belt-watch", 2999, "watches", DRESSY, "him", "men leather strap analog watch"),
  p("g12", "Classic Dress Watch", "mens-watches/longines-master-collection", 6999, "watches", DRESSY, "him", "men dress watch"),
  p("g13", "Black Dial Leather Watch", "mens-watches/rolex-cellini-date-black-dial", 4999, "watches", DRESSY, "him", "men black dial leather watch"),
  p("g14", "Moonphase Watch", "mens-watches/rolex-cellini-moonphase", 7999, "watches", DRESSY, "him", "moonphase watch men"),
  p("g15", "Steel Link Watch", "mens-watches/rolex-datejust", 5999, "watches", DRESSY, "him", "men steel analog watch"),
  p("g16", "Silver Steel Watch", "womens-watches/iwc-ingenieur-automatic-steel", 6499, "watches", DRESSY, "her", "women silver steel watch"),
  p("g17", "White Dial Classic Watch", "womens-watches/rolex-cellini-moonphase", 7499, "watches", DRESSY, "her", "women white dial watch"),
  p("g18", "Two-tone Bracelet Watch", "womens-watches/rolex-datejust-women", 6999, "watches", DRESSY, "her", "women two tone watch"),
  p("g19", "Gold Watch", "womens-watches/watch-gold-for-women", 4999, "watches", DRESSY, "her", "gold watch for women"),
  p("g20", "Rose Strap Watch", "womens-watches/women's-wrist-watch", 2999, "watches", DRESSY, "her", "women wrist watch"),

  // ---------------------------------- tech ---------------------------------
  p("g21", "Apple iPhone", "smartphones/iphone-5s", 39999, "tech", BDAY, "anyone", "apple iphone"),
  p("g22", "Apple Watch", "mobile-accessories/apple-watch-series-4-gold", 29999, "tech", BDAY, "anyone", "apple watch"),
  p("g23", "Apple MacBook", "laptops/apple-macbook-pro-14-inch-space-grey", 119999, "tech", CASUAL, "anyone", "apple macbook"),
  p("g24", "Apple iPad Mini", "tablets/ipad-mini-2021-starlight", 46999, "tech", CASUAL, "anyone", "apple ipad mini"),
  p("g25", "Samsung Galaxy Tab", "tablets/samsung-galaxy-tab-s8-plus-grey", 52999, "tech", CASUAL, "anyone", "samsung galaxy tab"),
  p("g26", "Amazon Echo Speaker", "mobile-accessories/amazon-echo-plus", 8999, "tech", CASUAL, "anyone", "amazon echo"),
  p("g27", "Apple AirPods", "mobile-accessories/apple-airpods", 11999, "tech", CASUAL, "anyone", "apple airpods"),
  p("g28", "Apple AirPods Max", "mobile-accessories/apple-airpods-max-silver", 49999, "tech", CASUAL, "anyone", "apple airpods max"),
  p("g29", "Wireless Charging Pad", "mobile-accessories/apple-airpower-wireless-charger", 1999, "tech", CASUAL, "anyone", "wireless charger"),
  p("g30", "Apple HomePod Mini", "mobile-accessories/apple-homepod-mini-cosmic-grey", 9999, "tech", CASUAL, "anyone", "apple homepod mini"),

  // -------------------------------- clothing -------------------------------
  p("g31", "Check Shirt", "mens-shirts/blue-&-black-check-shirt", 1299, "fashion", CASUAL, "him", "men check shirt"),
  p("g32", "Graphic T-shirt", "mens-shirts/gigabyte-aorus-men-tshirt", 799, "fashion", CASUAL, "him", "men graphic tshirt"),
  p("g33", "Plaid Shirt", "mens-shirts/man-plaid-shirt", 1499, "fashion", CASUAL, "him", "men plaid shirt"),
  p("g34", "Short Sleeve Shirt", "mens-shirts/man-short-sleeve-shirt", 999, "fashion", CASUAL, "him", "men casual shirt"),
  p("g35", "Blue Summer Dress", "tops/blue-frock", 1499, "fashion", CASUAL, "her", "women blue dress"),
  p("g36", "Floral Summer Dress", "tops/girl-summer-dress", 1299, "fashion", CASUAL, "her", "women summer dress"),
  p("g37", "Grey Midi Dress", "tops/gray-dress", 1699, "fashion", CASUAL, "her", "women midi dress"),
  p("g38", "Black Evening Gown", "womens-dresses/black-women's-gown", 4999, "fashion", DRESSY, "her", "women black evening gown"),
  p("g39", "Corset & Skirt Set", "womens-dresses/corset-leather-with-skirt", 3499, "fashion", CASUAL, "her", "corset skirt set women"),
  p("g40", "Black Corset Dress", "womens-dresses/corset-with-black-skirt", 2999, "fashion", CASUAL, "her", "black corset dress"),

  // --------------------------------- shoes ---------------------------------
  p("g41", "Nike Air Jordan 1", "mens-shoes/nike-air-jordan-1-red-and-black", 12999, "shoes", CASUAL, "him", "nike air jordan 1"),
  p("g42", "Nike Sports Cleats", "mens-shoes/nike-baseball-cleats", 5999, "shoes", CASUAL, "him", "nike sports shoes men"),
  p("g43", "Puma Future Rider", "mens-shoes/puma-future-rider-trainers", 6499, "shoes", CASUAL, "him", "puma future rider"),
  p("g44", "Retro Sneakers", "mens-shoes/sports-sneakers-off-white-&-red", 4999, "shoes", CASUAL, "him", "men retro sneakers"),
  p("g45", "Court Sneakers", "mens-shoes/sports-sneakers-off-white-red", 4499, "shoes", CASUAL, "him", "men court sneakers"),
  p("g46", "Cosy Slippers", "womens-shoes/black-&-brown-slipper", 999, "shoes", CASUAL, "her", "women slippers"),
  p("g47", "Calvin Klein Heels", "womens-shoes/calvin-klein-heel-shoes", 6999, "shoes", DRESSY, "her", "calvin klein heels"),
  p("g48", "Gold Party Heels", "womens-shoes/golden-shoes-woman", 2999, "shoes", DRESSY, "her", "gold heels women"),
  p("g49", "Ballet Flats", "womens-shoes/pampi-shoes", 1999, "shoes", CASUAL, "her", "ballet flats women"),
  p("g50", "Red Heels", "womens-shoes/red-shoes", 2499, "shoes", DRESSY, "her", "red heels women"),

  // ---------------------------- bags & jewellery ---------------------------
  p("g51", "Blue Handbag", "womens-bags/blue-women's-handbag", 2499, "accessories", DRESSY, "her", "women handbag blue"),
  p("g52", "Leather Tote Bag", "womens-bags/heshe-women's-leather-bag", 5999, "accessories", DRESSY, "her", "women leather tote bag"),
  p("g53", "Designer Handbag", "womens-bags/prada-women-bag", 15999, "accessories", DRESSY, "her", "designer handbag women"),
  p("g54", "White Mini Backpack", "womens-bags/white-faux-leather-backpack", 1999, "accessories", CASUAL, "her", "women mini backpack"),
  p("g55", "Black Handbag", "womens-bags/women-handbag-black", 2999, "accessories", DRESSY, "her", "women handbag black"),
  p("g56", "Crystal Earrings", "womens-jewellery/green-crystal-earring", 1499, "accessories", DRESSY, "her", "crystal earrings"),
  p("g57", "Emerald Drop Earrings", "womens-jewellery/green-oval-earring", 1999, "accessories", DRESSY, "her", "emerald drop earrings"),
  p("g58", "Tropical Earrings", "womens-jewellery/tropical-earring", 999, "accessories", CASUAL, "her", "statement earrings"),
  p("g59", "Black Sunglasses", "sunglasses/black-sun-glasses", 1499, "accessories", CASUAL, "anyone", "black sunglasses"),
  p("g60", "Round Sunglasses", "sunglasses/classic-sun-glasses", 1299, "accessories", CASUAL, "anyone", "round sunglasses"),

  // ------------------------------ home & kitchen ---------------------------
  p("g61", "Hanging Swing Chair", "home-decoration/decoration-swing", 4999, "home", HOMEY, "anyone", "hanging swing chair"),
  p("g62", "Photo Frame Collage", "home-decoration/family-tree-photo-frame", 1499, "home", HOMEY, "anyone", "photo frame collage wall"),
  p("g63", "Decorative Plant", "home-decoration/house-showpiece-plant", 1999, "home", HOMEY, "anyone", "artificial plant decor"),
  p("g64", "Ceramic Planter", "home-decoration/plant-pot", 899, "home", HOMEY, "anyone", "ceramic planter pot"),
  p("g65", "Table Lamp", "home-decoration/table-lamp", 2499, "home", HOMEY, "anyone", "bedside table lamp"),
  p("g66", "Wooden Bedside Table", "furniture/bedside-table-african-cherry", 8999, "home", HOMEY, "anyone", "wooden bedside table"),
  p("g67", "Designer Desk Chair", "furniture/knoll-saarinen-executive-conference-chair", 13999, "home", HOMEY, "anyone", "designer desk chair"),
  p("g68", "Microwave Oven", "kitchen-accessories/microwave-oven", 6999, "home", HOMEY, "anyone", "microwave oven"),
  p("g69", "Blender", "kitchen-accessories/boxed-blender", 2999, "home", HOMEY, "anyone", "blender mixer"),
  p("g70", "Steel & Glass Cook Pot", "kitchen-accessories/silver-pot-with-glass-cap", 1999, "home", HOMEY, "anyone", "steel cooking pot glass lid"),

  // --------------------------------- sports --------------------------------
  p("g71", "Cricket Bat", "sports-accessories/cricket-bat", 1999, "sports", CASUAL, "anyone", "cricket bat"),
  p("g72", "Cricket Ball", "sports-accessories/cricket-ball", 599, "sports", CASUAL, "anyone", "leather cricket ball"),
  p("g73", "Cricket Helmet", "sports-accessories/cricket-helmet", 2499, "sports", CASUAL, "anyone", "cricket helmet"),
  p("g74", "Football", "sports-accessories/football", 1299, "sports", CASUAL, "anyone", "football size 5"),
  p("g75", "Basketball", "sports-accessories/basketball", 999, "sports", CASUAL, "anyone", "basketball"),
  p("g76", "Volleyball", "sports-accessories/volleyball", 799, "sports", CASUAL, "anyone", "volleyball"),
  p("g77", "Tennis Racket", "sports-accessories/tennis-racket", 2999, "sports", CASUAL, "anyone", "tennis racket"),
  p("g78", "Tennis Balls (Pack)", "sports-accessories/tennis-ball", 499, "sports", CASUAL, "anyone", "tennis balls pack"),
  p("g79", "Feather Shuttlecocks", "sports-accessories/feather-shuttlecock", 699, "sports", CASUAL, "anyone", "feather shuttlecock badminton"),
  p("g80", "Baseball Glove", "sports-accessories/baseball-glove", 1499, "sports", CASUAL, "anyone", "baseball glove"),
];

export function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}
