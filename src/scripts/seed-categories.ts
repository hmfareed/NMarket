import { connectToDatabase } from "../lib/mongodb";
import { Category } from "../models/Category";

const NORTHERN_CATEGORIES = [
  {
    name: "Phones & Consumer Tech",
    slug: "phones-tech",
    description: "Smartphones, chargers, solar power banks, Bluetooth audio, and mobile accessories in Tamale",
    icon: "Smartphone",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60",
    order: 1,
    featured: true,
  },
  {
    name: "Fashion, Smocks & Textiles",
    slug: "fashion-smocks",
    description: "Authentic handwoven Northern Ghanaian smocks (Fugu), local fabrics, footwear, and apparel",
    icon: "Shirt",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=60",
    order: 2,
    featured: true,
  },
  {
    name: "Fresh Groceries & Produce",
    slug: "fresh-groceries",
    description: "Direct farm yams, local Northern rice, groundnuts, grains, and fresh market produce",
    icon: "Apple",
    image: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=60",
    order: 3,
    featured: true,
  },
  {
    name: "Pure Shea & Natural Beauty",
    slug: "shea-beauty",
    description: "Traditional raw unrefined shea butter, black soap, natural oils, and skincare",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1608248597359-25f0a82b4dc2?w=600&auto=format&fit=crop&q=60",
    order: 4,
    featured: true,
  },
  {
    name: "Home, Solar & Hardware",
    slug: "home-solar",
    description: "Solar panels, backup inverters, rechargeable fans, electricals, and home hardware",
    icon: "Sun",
    image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=60",
    order: 5,
    featured: true,
  },
  {
    name: "Provisions & Daily Essentials",
    slug: "provisions-essentials",
    description: "Cooking oils, canned foods, household supplies, beverages, and pantry staples",
    icon: "ShoppingBag",
    image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=600&auto=format&fit=crop&q=60",
    order: 6,
    featured: true,
  },
];

async function seedCategories() {
  console.log("🌱 Connecting to MongoDB Atlas to seed categories...");
  await connectToDatabase();

  for (const cat of NORTHERN_CATEGORIES) {
    const res = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $set: cat },
      { upsert: true, new: true }
    );
    console.log(`✅ Upserted Category: ${res.name} (${res.slug})`);
  }

  const count = await Category.countDocuments();
  console.log(`🎉 Categories successfully seeded! Total active categories: ${count}`);
  process.exit(0);
}

seedCategories().catch((err) => {
  console.error("❌ Error seeding categories:", err);
  process.exit(1);
});
