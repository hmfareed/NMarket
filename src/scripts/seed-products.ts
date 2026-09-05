import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb";
import { Product } from "../models/Product";
import { Store } from "../models/Store";

const MOCK_PRODUCTS = [
  // 1. Phones & Consumer Tech / Electronics / Computing
  {
    name: "Samsung Galaxy A15 128GB - Blue Black",
    slug: "samsung-galaxy-a15-128gb-blue-black",
    category: "phones-tech",
    brand: "Samsung",
    price: 1850,
    compareAtPrice: 2100,
    description: "Brand new sealed Samsung Galaxy A15 with 4GB RAM, 128GB ROM, 50MP triple camera, 5000mAh battery. 1-year official warranty.",
    images: [
      { url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 15, reserved: 2, available: 13, lowStockThreshold: 2 },
  },
  {
    name: "Oraimo 20,000mAh Solar Fast-Charging Power Bank",
    slug: "oraimo-20000mah-solar-fast-charging-power-bank",
    category: "phones-tech",
    brand: "Oraimo",
    price: 240,
    compareAtPrice: 290,
    description: "High capacity multi-port 20,000mAh power bank with dual USB fast-charge and built-in LED torchlight, ideal for Tamale power backup.",
    images: [
      { url: "https://images.unsplash.com/photo-1609592807963-38c64bb729bc?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 30, reserved: 3, available: 27, lowStockThreshold: 5 },
  },
  {
    name: "HP 250 G8 Core i5 Laptop (8GB RAM / 256GB SSD)",
    slug: "hp-250-g8-core-i5-laptop",
    category: "phones-tech",
    brand: "HP",
    price: 4950,
    compareAtPrice: 5400,
    description: "Reliable HP business laptop with 11th Gen Intel Core i5, 8GB DDR4 RAM, 256GB NVMe SSD, 15.6-inch anti-glare display, Windows 11 Pro.",
    images: [
      { url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 8, reserved: 1, available: 7, lowStockThreshold: 2 },
  },

  // 2. Fashion, Smocks & Textiles / Shoes / Accessories
  {
    name: "Handwoven Royal Dagbon Smock (Fugu) - Navy & White",
    slug: "handwoven-royal-dagbon-smock-fugu-navy-white",
    category: "fashion-smocks",
    brand: "Dagbon Artisans",
    price: 450,
    compareAtPrice: 520,
    description: "Mastercrafted traditional heavy-weave cotton Dagbon smock woven in Tamale. High durability with authentic hand-stitched neck embroidery.",
    images: [
      { url: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 20, reserved: 2, available: 18, lowStockThreshold: 3 },
  },
  {
    name: "Tamale Handcrafted Genuine Leather Slippers",
    slug: "tamale-handcrafted-genuine-leather-slippers",
    category: "fashion-smocks",
    brand: "Northern Leatherworks",
    price: 120,
    compareAtPrice: 150,
    description: "Traditional Northern Ghanaian pure cowhide leather slippers, handmade by local leather artisans in Sakasaka, Tamale. Sizes 41-45.",
    images: [
      { url: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 25, reserved: 4, available: 21, lowStockThreshold: 4 },
  },

  // 3. Pure Shea & Natural Beauty / Health & Beauty
  {
    name: "100% Pure Unrefined Northern Shea Butter (1kg Tub)",
    slug: "100-pure-unrefined-northern-shea-butter-1kg",
    category: "shea-beauty",
    brand: "Savannah Organics",
    price: 45,
    compareAtPrice: 60,
    description: "Grade-A raw ivory unrefined shea butter freshly processed by women cooperatives in Northern Ghana. Rich in Vitamins A, E and natural moisture.",
    images: [
      { url: "https://images.unsplash.com/photo-1608248597359-25f0a82b4dc2?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 50, reserved: 5, available: 45, lowStockThreshold: 10 },
  },
  {
    name: "Organic African Black Soap with Moringa & Honey (350g)",
    slug: "organic-african-black-soap-with-moringa-honey",
    category: "shea-beauty",
    brand: "Savannah Organics",
    price: 35,
    compareAtPrice: 45,
    description: "Traditional Alata Samina handmade with cocoa pod ash, unrefined shea butter, organic moringa extract, and savannah wild honey.",
    images: [
      { url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 40, reserved: 3, available: 37, lowStockThreshold: 8 },
  },

  // 4. Fresh Groceries & Produce / Foodstuffs
  {
    name: "Tamale Fresh Tubers of White Pona Yam (Set of 3 Large)",
    slug: "tamale-fresh-tubers-of-white-pona-yam-set-of-3",
    category: "fresh-groceries",
    brand: "Local Farmers",
    price: 85,
    compareAtPrice: 110,
    description: "Freshly harvested sweet and floury Northern Pona yams straight from regional farm gates to Tamale Central Market. Excellent for boiled yam or fufu.",
    images: [
      { url: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 35, reserved: 5, available: 30, lowStockThreshold: 5 },
  },
  {
    name: "Authentic Tamale Dawadawa Cakes (Organic 500g Pack)",
    slug: "authentic-tamale-dawadawa-cakes-500g",
    category: "fresh-groceries",
    brand: "Tamale Kitchen Staples",
    price: 30,
    compareAtPrice: 40,
    description: "Fermented African locust bean (Dawadawa) prepared traditionally in Tamale. Imparts deep authentic savory flavor to soups, jollof, and stews.",
    images: [
      { url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 45, reserved: 4, available: 41, lowStockThreshold: 8 },
  },
  {
    name: "Pure Savannah Wildflower Honey (1 Liter Bottle)",
    slug: "pure-savannah-wildflower-honey-1-liter",
    category: "fresh-groceries",
    brand: "Northern BeeKeepers",
    price: 75,
    compareAtPrice: 90,
    description: "100% natural, raw unpasteurized amber honey harvested from wild forest hives across Northern Ghana. Never diluted or heated.",
    images: [
      { url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 28, reserved: 2, available: 26, lowStockThreshold: 5 },
  },

  // 5. Home, Solar & Hardware / Appliances / Home & Office
  {
    name: "Binatone 16-Inch Rechargeable Standing Fan with Solar Input",
    slug: "binatone-16-inch-rechargeable-standing-fan",
    category: "home-solar",
    brand: "Binatone",
    price: 680,
    compareAtPrice: 750,
    description: "Heavy-duty 16-inch oscillating fan with built-in 12V rechargeable battery (up to 8 hours runtime), USB phone charging port, and solar DC input socket.",
    images: [
      { url: "https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 12, reserved: 1, available: 11, lowStockThreshold: 2 },
  },
  {
    name: "Complete 150W Solar Home Lighting & Charging Kit",
    slug: "complete-150w-solar-home-lighting-charging-kit",
    category: "home-solar",
    brand: "Savannah Solar",
    price: 1250,
    compareAtPrice: 1400,
    description: "All-in-one solar energy system including 150W monocrystalline solar panel, 4 high-lumen LED bulbs with switches, controller, and multi-USB phone charger.",
    images: [
      { url: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 10, reserved: 1, available: 9, lowStockThreshold: 2 },
  },

  // 6. Provisions & Daily Essentials
  {
    name: "Frytol Pure Vegetable Cooking Oil (5 Liters Gallon)",
    slug: "frytol-pure-vegetable-cooking-oil-5-liters",
    category: "provisions-essentials",
    brand: "Frytol",
    price: 135,
    compareAtPrice: 155,
    description: "Fortified with Vitamin A, 100% cholesterol-free pure refined vegetable cooking oil for household frying and cooking.",
    images: [
      { url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 30, reserved: 3, available: 27, lowStockThreshold: 6 },
  },
  {
    name: "Indomie Instant Noodles Onion Chicken Flavor (Carton of 40)",
    slug: "indomie-instant-noodles-onion-chicken-carton-of-40",
    category: "provisions-essentials",
    brand: "Indomie",
    price: 160,
    compareAtPrice: 180,
    description: "Full wholesale carton containing 40 individual 70g packs of popular Indomie Onion Chicken flavored instant noodles.",
    images: [
      { url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 22, reserved: 2, available: 20, lowStockThreshold: 4 },
  },

  // 7. Sports & Baby Products
  {
    name: "Official Ghana Black Stars Home Jersey 2024/2025",
    slug: "official-ghana-black-stars-home-jersey",
    category: "sports",
    brand: "Puma Style",
    price: 180,
    compareAtPrice: 220,
    description: "High quality breathable football kit with embroidered national crest and Black Star chest badge. Available in M, L, XL.",
    images: [
      { url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 18, reserved: 1, available: 17, lowStockThreshold: 3 },
  },
  {
    name: "SoftCare Baby Diapers Jumbo Pack (Size 3 - 64 Pieces)",
    slug: "softcare-baby-diapers-jumbo-pack-size-3",
    category: "baby-products",
    brand: "SoftCare",
    price: 95,
    compareAtPrice: 115,
    description: "Ultra-absorbent, breathable leak-proof baby diapers with wetness indicator and elastic waistbands. Gentle on baby's sensitive skin.",
    images: [
      { url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=60", isPrimary: true },
    ],
    inventory: { onHand: 26, reserved: 2, available: 24, lowStockThreshold: 5 },
  },
];

async function seedProducts() {
  console.log("🌱 Connecting to MongoDB to seed products across all categories...");
  await connectToDatabase();

  let store = await Store.findOne({ status: "ACTIVE" });
  if (!store) {
    store = await Store.findOne();
  }

  if (!store) {
    console.error("No store found to attach products to.");
    process.exit(1);
  }

  const storeId = store._id;
  const storeCoordinates = (store.address as any)?.location?.coordinates || [-0.8520, 9.3900];

  for (const item of MOCK_PRODUCTS) {
    const productData = {
      ...item,
      storeId,
      status: "PUBLISHED",
      location: {
        type: "Point",
        coordinates: storeCoordinates,
      },
      rating: {
        average: 4.8,
        count: Math.floor(Math.random() * 20) + 5,
      },
    };

    await Product.findOneAndUpdate(
      { slug: item.slug },
      { $set: productData },
      { upsert: true, new: true }
    );
    console.log(`✅ Upserted Product: ${item.name} [Category: ${item.category}]`);
  }

  const count = await Product.countDocuments({ status: "PUBLISHED" });
  console.log(`🎉 Products successfully seeded! Total published products: ${count}`);
  process.exit(0);
}

seedProducts().catch((err) => {
  console.error("❌ Error seeding products:", err);
  process.exit(1);
});
