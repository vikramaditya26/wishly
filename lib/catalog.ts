// ---------------------------------------------------------------------------
// The curated gift catalog: 8 categories x 10 products.
// Products link to affiliate-tagged amazon.in search results (safer than
// hard-coding ASINs which go out of stock). To add/edit products just edit
// this file - no database involved.
// ---------------------------------------------------------------------------

import type { CatalogProduct, ForWho, Occasion, Vibe } from "./types";

export const OCCASIONS: { id: Occasion; label: string; emoji: string }[] = [
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "wedding", label: "Wedding", emoji: "💍" },
  { id: "anniversary", label: "Anniversary", emoji: "💖" },
  { id: "housewarming", label: "Housewarming", emoji: "🏡" },
  { id: "baby", label: "Baby Shower", emoji: "🍼" },
  { id: "justbecause", label: "Just Because", emoji: "✨" },
];

export const FOR_WHO: { id: ForWho; label: string; emoji: string }[] = [
  { id: "her", label: "For Her", emoji: "💁‍♀️" },
  { id: "him", label: "For Him", emoji: "🙋‍♂️" },
  { id: "kids", label: "For Kids", emoji: "🧒" },
  { id: "couple", label: "For a Couple", emoji: "👩‍❤️‍👨" },
];

export const VIBES: { id: Vibe; label: string; emoji: string }[] = [
  { id: "student", label: "Student", emoji: "🎒" },
  { id: "working", label: "Working", emoji: "💼" },
];

export const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: "beauty", label: "Makeup & Beauty", emoji: "💄" },
  { id: "tech", label: "Tech & Gadgets", emoji: "🎧" },
  { id: "decor", label: "Home Decor", emoji: "🕯️" },
  { id: "fashion", label: "Fashion & Accessories", emoji: "👜" },
  { id: "toys", label: "Toys & Games", emoji: "🧸" },
  { id: "kitchen", label: "Kitchen & Dining", emoji: "☕" },
  { id: "books", label: "Books & Stationery", emoji: "📚" },
  { id: "selfcare", label: "Self-care & Wellness", emoji: "🧖‍♀️" },
];

// Pastel gradients for product cards; picked deterministically per product id
// so a product always shows the same colours everywhere.
export const GRADIENTS = [
  "from-pink-200 to-rose-100",
  "from-violet-200 to-fuchsia-100",
  "from-sky-200 to-cyan-100",
  "from-amber-200 to-yellow-100",
  "from-emerald-200 to-teal-100",
  "from-orange-200 to-amber-100",
  "from-indigo-200 to-purple-100",
  "from-lime-200 to-emerald-100",
];

export function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[h % GRADIENTS.length];
}

// Guest-page themes.
export const THEMES: {
  id: string;
  label: string;
  emoji: string;
  pageBg: string; // gradient behind the whole guest page
  heroEmojis: string; // decorative emoji row on the guest page
}[] = [
  { id: "confetti", label: "Confetti Pop", emoji: "🎉", pageBg: "from-pink-100 via-purple-50 to-sky-100", heroEmojis: "🎂🎈🎉🎁✨" },
  { id: "roses", label: "Royal Roses", emoji: "🌹", pageBg: "from-rose-100 via-amber-50 to-orange-100", heroEmojis: "💍🌹💐🪔✨" },
  { id: "hearts", label: "Lovey Dovey", emoji: "💖", pageBg: "from-red-100 via-pink-50 to-rose-100", heroEmojis: "💖💕💘🥰💝" },
  { id: "sunshine", label: "Sunny Home", emoji: "🌻", pageBg: "from-amber-100 via-yellow-50 to-lime-100", heroEmojis: "🏡🌻🪴☀️🧿" },
  { id: "clouds", label: "Baby Clouds", emoji: "☁️", pageBg: "from-sky-100 via-indigo-50 to-pink-100", heroEmojis: "☁️🍼🧸⭐👶" },
];

const ALL: Occasion[] = ["birthday", "wedding", "anniversary", "housewarming", "baby", "justbecause"];
const ADULT: Occasion[] = ["birthday", "wedding", "anniversary", "justbecause"];

function p(
  id: string,
  name: string,
  emoji: string,
  price: string,
  category: string,
  amazonQuery: string,
  occasions: Occasion[],
  forWho: ForWho[],
  vibe: Vibe = "any"
): CatalogProduct {
  return { id, name, emoji, price, category, amazonQuery, occasions, forWho, vibe };
}

export const PRODUCTS: CatalogProduct[] = [
  // ------------------------------ beauty ------------------------------
  p("b1", "Matte Lipstick Set", "💄", "₹299 – ₹799", "beauty", "matte lipstick set", ADULT, ["her"]),
  p("b2", "Sunscreen SPF 50", "🧴", "₹299 – ₹599", "beauty", "sunscreen spf 50 gel", ADULT, ["her", "him"]),
  p("b3", "Perfume Gift Set", "🌸", "₹499 – ₹1,499", "beauty", "perfume gift set women", ADULT, ["her"]),
  p("b4", "Men's Perfume", "🕺", "₹399 – ₹1,299", "beauty", "perfume for men long lasting", ADULT, ["him"]),
  p("b5", "Nail Polish Combo", "💅", "₹199 – ₹499", "beauty", "nail polish combo set", ["birthday", "justbecause"], ["her"], "student"),
  p("b6", "Makeup Brush Kit", "🖌️", "₹399 – ₹999", "beauty", "makeup brush set with pouch", ADULT, ["her"]),
  p("b7", "Lip Balm & Gloss Duo", "💋", "₹149 – ₹399", "beauty", "tinted lip balm gloss", ["birthday", "justbecause"], ["her"], "student"),
  p("b8", "Hair Serum", "✨", "₹249 – ₹699", "beauty", "hair serum for frizzy hair", ADULT, ["her"]),
  p("b9", "Beard Grooming Kit", "🧔", "₹399 – ₹999", "beauty", "beard grooming kit men", ADULT, ["him"]),
  p("b10", "Compact Mirror & Kit Pouch", "🪞", "₹199 – ₹599", "beauty", "makeup pouch with mirror", ADULT, ["her"]),

  // ------------------------------- tech -------------------------------
  p("t1", "Wireless Earbuds", "🎧", "₹999 – ₹2,499", "tech", "wireless earbuds", ADULT, ["her", "him"]),
  p("t2", "Smartwatch", "⌚", "₹1,299 – ₹2,999", "tech", "smartwatch", ADULT, ["her", "him"]),
  p("t3", "Bluetooth Speaker", "🔊", "₹999 – ₹2,499", "tech", "bluetooth speaker portable", ADULT, ["her", "him"]),
  p("t4", "Power Bank 20000mAh", "🔋", "₹999 – ₹1,799", "tech", "power bank 20000mah", ADULT, ["her", "him"]),
  p("t5", "Phone Stand & Desk Light", "💡", "₹299 – ₹799", "tech", "phone stand desk lamp", ADULT, ["her", "him"], "working"),
  p("t6", "Instant Photo Printer", "📸", "₹2,999 – ₹6,999", "tech", "mini photo printer", ["birthday", "wedding", "anniversary"], ["her", "him", "couple"]),
  p("t7", "Gaming Mouse", "🖱️", "₹699 – ₹1,999", "tech", "gaming mouse rgb", ["birthday", "justbecause"], ["him", "kids"], "student"),
  p("t8", "Kindle / E-reader", "📖", "₹7,999 – ₹12,999", "tech", "kindle e reader", ADULT, ["her", "him"], "working"),
  p("t9", "Fitness Band", "🏃", "₹1,499 – ₹2,999", "tech", "fitness band", ADULT, ["her", "him"]),
  p("t10", "Polaroid Camera", "🎞️", "₹5,999 – ₹9,999", "tech", "instax instant camera", ["birthday", "wedding", "anniversary"], ["her", "couple"]),

  // ------------------------------- decor ------------------------------
  p("d1", "Fairy Lights", "🧚", "₹199 – ₹499", "decor", "fairy lights for bedroom", ALL, ["her", "him", "couple"], "student"),
  p("d2", "Scented Candles Set", "🕯️", "₹299 – ₹899", "decor", "scented candles gift set", ALL, ["her", "couple"]),
  p("d3", "Photo Frame Collage", "🖼️", "₹399 – ₹999", "decor", "photo frame collage wall set", ["wedding", "anniversary", "housewarming"], ["couple"]),
  p("d4", "Indoor Plants Set", "🪴", "₹299 – ₹799", "decor", "indoor plants with pot", ["housewarming", "justbecause"], ["her", "him", "couple"]),
  p("d5", "Wall Clock (Aesthetic)", "🕰️", "₹499 – ₹1,499", "decor", "aesthetic wall clock", ["wedding", "housewarming"], ["couple"]),
  p("d6", "Moon Lamp", "🌙", "₹499 – ₹1,299", "decor", "moon lamp 3d", ["birthday", "anniversary", "justbecause"], ["her", "him", "couple"]),
  p("d7", "Boho Cushion Covers", "🛋️", "₹399 – ₹999", "decor", "boho cushion covers set", ["housewarming", "wedding"], ["couple"]),
  p("d8", "Tapestry / Wall Hanging", "🌈", "₹299 – ₹699", "decor", "wall tapestry aesthetic", ["birthday", "housewarming", "justbecause"], ["her", "him"], "student"),
  p("d9", "Table Lamp (Cute)", "🛋️", "₹599 – ₹1,499", "decor", "bedside table lamp", ["housewarming", "wedding"], ["couple"]),
  p("d10", "Name LED Neon Sign", "💫", "₹999 – ₹2,499", "decor", "neon sign light bedroom", ["birthday", "anniversary"], ["her", "him", "couple"]),

  // ------------------------------ fashion -----------------------------
  p("f1", "Analog Watch", "⌚", "₹999 – ₹2,999", "fashion", "analog watch", ADULT, ["her", "him"], "working"),
  p("f2", "Sneakers", "👟", "₹999 – ₹2,999", "fashion", "casual sneakers", ["birthday", "justbecause"], ["her", "him"], "student"),
  p("f3", "Tote Bag (Aesthetic)", "👜", "₹299 – ₹899", "fashion", "canvas tote bag aesthetic", ["birthday", "justbecause"], ["her"], "student"),
  p("f4", "Wallet (Leather)", "👛", "₹499 – ₹1,499", "fashion", "leather wallet", ADULT, ["her", "him"], "working"),
  p("f5", "Sunglasses", "🕶️", "₹499 – ₹1,499", "fashion", "sunglasses uv protected", ["birthday", "justbecause"], ["her", "him"]),
  p("f6", "Silver Jewellery Set", "💎", "₹499 – ₹1,999", "fashion", "silver jewellery set women", ["birthday", "wedding", "anniversary"], ["her"]),
  p("f7", "Silk Scarf / Stole", "🧣", "₹299 – ₹899", "fashion", "silk scarf stole women", ["birthday", "wedding"], ["her"]),
  p("f8", "Backpack (Laptop)", "🎒", "₹799 – ₹1,999", "fashion", "laptop backpack", ["birthday", "justbecause"], ["her", "him"], "student"),
  p("f9", "Cufflinks & Tie Set", "👔", "₹499 – ₹1,299", "fashion", "cufflinks tie gift set men", ["wedding", "anniversary"], ["him"], "working"),
  p("f10", "Hair Accessories Kit", "🎀", "₹199 – ₹499", "fashion", "hair accessories claw clips set", ["birthday", "justbecause"], ["her"], "student"),

  // ------------------------------- toys -------------------------------
  p("y1", "Giant Teddy Bear", "🧸", "₹499 – ₹1,499", "toys", "big teddy bear", ["birthday", "baby", "justbecause"], ["her", "kids"]),
  p("y2", "LEGO / Building Blocks", "🧱", "₹499 – ₹2,499", "toys", "building blocks set kids", ["birthday", "baby"], ["kids"]),
  p("y3", "Board Game (Family)", "🎲", "₹499 – ₹1,499", "toys", "family board game", ["birthday", "housewarming", "justbecause"], ["kids", "couple"]),
  p("y4", "Remote Control Car", "🏎️", "₹699 – ₹1,999", "toys", "remote control car kids", ["birthday"], ["kids"]),
  p("y5", "Art & Craft Kit", "🎨", "₹299 – ₹899", "toys", "art craft kit kids", ["birthday", "baby"], ["kids"]),
  p("y6", "Puzzle 1000 pieces", "🧩", "₹399 – ₹999", "toys", "jigsaw puzzle 1000 pieces", ["birthday", "justbecause"], ["her", "him", "kids"]),
  p("y7", "Soft Toys Combo", "🐻", "₹399 – ₹999", "toys", "soft toys combo", ["baby", "birthday"], ["kids"]),
  p("y8", "Rubik's Cube Set", "🟩", "₹199 – ₹599", "toys", "rubik cube set", ["birthday", "justbecause"], ["kids", "him"], "student"),
  p("y9", "Kids' Story Books Set", "📕", "₹299 – ₹799", "toys", "story books for kids set", ["birthday", "baby"], ["kids"]),
  p("y10", "Baby Care Gift Hamper", "👶", "₹599 – ₹1,499", "toys", "new born baby gift hamper", ["baby"], ["kids", "couple"]),

  // ------------------------------ kitchen -----------------------------
  p("k1", "Ceramic Mug Set", "☕", "₹299 – ₹799", "kitchen", "ceramic coffee mug set", ["housewarming", "wedding", "justbecause"], ["couple", "her", "him"]),
  p("k2", "Electric Kettle", "🫖", "₹599 – ₹1,299", "kitchen", "electric kettle 1.5 litre", ["housewarming", "wedding"], ["couple"], "working"),
  p("k3", "Air Fryer", "🍟", "₹2,499 – ₹5,999", "kitchen", "air fryer", ["wedding", "housewarming"], ["couple"]),
  p("k4", "Coffee Maker (French Press)", "☕", "₹499 – ₹1,499", "kitchen", "french press coffee maker", ["housewarming", "wedding", "birthday"], ["her", "him", "couple"], "working"),
  p("k5", "Dinner Set", "🍽️", "₹999 – ₹2,999", "kitchen", "dinner set", ["wedding", "housewarming"], ["couple"]),
  p("k6", "Insulated Water Bottle", "🥤", "₹399 – ₹999", "kitchen", "insulated water bottle 1 litre", ["birthday", "justbecause"], ["her", "him", "kids"], "student"),
  p("k7", "Masala Box & Jars Set", "🫙", "₹399 – ₹999", "kitchen", "masala box kitchen storage jars", ["wedding", "housewarming"], ["couple"]),
  p("k8", "Chopper & Kitchen Tools", "🔪", "₹299 – ₹799", "kitchen", "vegetable chopper kitchen tool set", ["housewarming", "wedding"], ["couple"]),
  p("k9", "Bento Lunch Box", "🍱", "₹399 – ₹999", "kitchen", "bento lunch box office", ["birthday", "justbecause"], ["her", "him"], "working"),
  p("k10", "Chocolate Gift Hamper", "🍫", "₹399 – ₹1,299", "kitchen", "chocolate gift hamper", ALL, ["her", "him", "kids", "couple"]),

  // ------------------------------- books ------------------------------
  p("bk1", "Bestseller Fiction Novel", "📖", "₹199 – ₹499", "books", "bestseller fiction novels", ADULT, ["her", "him"]),
  p("bk2", "Self-help Bestseller", "🧠", "₹199 – ₹499", "books", "atomic habits book", ADULT, ["her", "him"], "working"),
  p("bk3", "Journal & Planner", "📓", "₹299 – ₹799", "books", "daily planner journal aesthetic", ADULT, ["her", "him"], "working"),
  p("bk4", "Fountain Pen Set", "🖋️", "₹399 – ₹1,299", "books", "fountain pen gift set", ["birthday", "anniversary"], ["him", "her"], "working"),
  p("bk5", "Scrapbook / Memory Book", "📔", "₹299 – ₹699", "books", "scrapbook memory book diy", ["anniversary", "birthday"], ["her", "couple"], "student"),
  p("bk6", "Desk Organiser (Wooden)", "🗂️", "₹399 – ₹999", "books", "wooden desk organiser", ["birthday", "justbecause"], ["him", "her"], "working"),
  p("bk7", "Sketching & Drawing Kit", "✏️", "₹299 – ₹899", "books", "sketching pencils drawing kit", ["birthday"], ["kids", "her", "him"], "student"),
  p("bk8", "Poetry / Shayari Collection", "🌙", "₹149 – ₹399", "books", "poetry books collection", ["birthday", "justbecause"], ["her", "him"], "student"),
  p("bk9", "Cute Sticky Notes & Pens", "🖍️", "₹149 – ₹399", "books", "cute stationery set sticky notes gel pens", ["birthday", "justbecause"], ["her", "kids"], "student"),
  p("bk10", "Bookends & Book Lights", "💡", "₹299 – ₹799", "books", "book reading light bookends", ["birthday", "justbecause"], ["her", "him"]),

  // ----------------------------- selfcare -----------------------------
  p("s1", "Spa Gift Hamper", "🧖‍♀️", "₹499 – ₹1,499", "selfcare", "spa gift hamper women", ADULT, ["her"]),
  p("s2", "Yoga Mat", "🧘", "₹499 – ₹1,299", "selfcare", "yoga mat anti slip", ADULT, ["her", "him"]),
  p("s3", "Essential Oil Diffuser", "💨", "₹499 – ₹1,299", "selfcare", "aroma diffuser essential oil set", ["housewarming", "birthday", "anniversary"], ["her", "couple"]),
  p("s4", "Silk Pillowcase & Eye Mask", "😴", "₹399 – ₹999", "selfcare", "silk pillowcase eye mask set", ["birthday", "wedding"], ["her"]),
  p("s5", "Neck & Back Massager", "💆", "₹999 – ₹2,499", "selfcare", "neck back massager", ADULT, ["her", "him"], "working"),
  p("s6", "Green Tea / Herbal Tea Set", "🍵", "₹299 – ₹799", "selfcare", "herbal green tea gift set", ADULT, ["her", "him"], "working"),
  p("s7", "Skincare Gift Kit", "🧴", "₹499 – ₹1,499", "selfcare", "skincare gift set", ADULT, ["her"]),
  p("s8", "Gratitude Journal", "🙏", "₹249 – ₹599", "selfcare", "gratitude journal", ADULT, ["her", "him"]),
  p("s9", "Bath Bombs & Shower Set", "🛁", "₹299 – ₹899", "selfcare", "bath bombs gift set", ["birthday", "justbecause"], ["her"], "student"),
  p("s10", "Sipper + Gym Kit", "🏋️", "₹499 – ₹1,299", "selfcare", "gym shaker bottle kit", ["birthday", "justbecause"], ["him", "her"], "student"),
];
