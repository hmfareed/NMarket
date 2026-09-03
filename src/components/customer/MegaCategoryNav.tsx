"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Smartphone,
  Home,
  Tv,
  Radio,
  Laptop,
  Shirt,
  Package,
  ShoppingBasket,
  Trophy,
  Baby,
  Gamepad2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

// Realistic Health & Beauty icon matching Jumia's lotion bottle and lipstick design
export function HealthBeautyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Sleek cosmetic lotion / serum bottle */}
      <rect x="3" y="8" width="9" height="13" rx="2" />
      <path d="M5.5 8V4.5A1.5 1.5 0 0 1 7 3h1a1.5 1.5 0 0 1 1.5 1.5V8" />
      <line x1="7.5" y1="3" x2="7.5" y2="1.5" />
      <line x1="5" y1="12" x2="10" y2="12" />

      {/* Modern angled lipstick */}
      <rect x="15" y="11" width="6" height="10" rx="1" />
      <path d="M16 11V6.5l4-2.5v7" />
      <line x1="15" y1="15" x2="21" y2="15" />
    </svg>
  );
}

export interface SubCategoryGroup {
  title: string;
  items: string[];
}

export interface MegaCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  badge?: string;
  groups: SubCategoryGroup[];
}

export const MEGA_CATEGORIES: MegaCategory[] = [
  {
    id: "official-stores",
    name: "Official Stores",
    icon: ShieldCheck,
    color: "text-slate-600 group-hover:text-amber-600",
    badge: "Verified",
    groups: [
      {
        title: "VERIFIED TAMALE STORES",
        items: [
          "Alhaji Electronics",
          "Savanna Fashion & Smocks",
          "Northern Shea Hub",
          "Dagbon Craft Village",
          "Central Market Wholesale",
          "Tamale Tech Store",
        ],
      },
      {
        title: "BUYER SAFEGUARDS",
        items: [
          "Delivery OTP Release Guard",
          "Ghana Card Verified Sellers",
          "Tamale 45-Min Express Dispatch",
          "3-Day Return & Escrow Protection",
        ],
      },
    ],
  },
  {
    id: "phones-tablets",
    name: "Phones & Tablets",
    icon: Smartphone,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "MOBILE PHONES",
        items: [
          "Smartphones",
          "iPhones",
          "Samsung Galaxy",
          "Tecno & Infinix",
          "Xiaomi & Redmi",
          "Basic & Feature Phones",
        ],
      },
      {
        title: "TABLETS",
        items: [
          "iPads",
          "Android Tablets",
          "Drawing Tablets",
          "Kids Learning Tablets",
        ],
      },
      {
        title: "MOBILE ACCESSORIES",
        items: [
          "Phone Cases & Covers",
          "Fast Chargers & Type-C Cables",
          "Heavy Duty Power Banks",
          "Tempered Glass Protectors",
          "Bluetooth Earphones",
        ],
      },
    ],
  },
  {
    id: "health-beauty",
    name: "Health & Beauty",
    icon: HealthBeautyIcon,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "ORGANIC SHEA & SKINCARE",
        items: [
          "Raw Northern Shea Butter",
          "Authentic Shea Black Soap",
          "Herbal Moisturizers",
          "Organic Cocoa Butter",
          "Stretch Mark & Glow Oils",
        ],
      },
      {
        title: "HAIR CARE & SALON",
        items: [
          "Herbal Shampoos & Oils",
          "Human Hair Wigs & Braids",
          "Hair Clippers & Trimmers",
          "Salon Hair Dryers",
        ],
      },
      {
        title: "FRAGRANCE & MAKEUP",
        items: [
          "Designer Perfumes & Oils",
          "Body Sprays & Deodorants",
          "Lipsticks & Lip Gloss",
          "Face Powders & Foundations",
        ],
      },
    ],
  },
  {
    id: "home-office",
    name: "Home & Office",
    icon: Home,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "LIVING ROOM & BEDDING",
        items: [
          "Bed Sheets & Duvets",
          "Treated Mosquito Nets",
          "Window Curtains & Rods",
          "Throw Pillows & Carpets",
        ],
      },
      {
        title: "KITCHEN & DINING",
        items: [
          "Stainless Cookware Sets",
          "Dinner Sets & Glasses",
          "Food Storage Containers",
          "Traditional Clay Pots",
        ],
      },
      {
        title: "OFFICE FURNITURE",
        items: [
          "Ergonomic Swivel Chairs",
          "Study & Laptop Desks",
          "Steel Cabinets",
          "Desk Lamps & Organizers",
        ],
      },
    ],
  },
  {
    id: "appliances",
    name: "Appliances",
    icon: Tv,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "LARGE APPLIANCES",
        items: [
          "Refrigerators",
          "Freezers & Chest Freezers",
          "Washing Machines",
          "Water Dispensers",
          "Gas Cookers & Ovens",
        ],
      },
      {
        title: "SMALL APPLIANCES",
        items: [
          "Heavy Duty Blenders",
          "Rice Cookers",
          "Microwave Ovens",
          "Electric Fufu Machine",
          "Air Fryers & Deep Fryers",
          "Electric Kettles",
        ],
      },
      {
        title: "HEATING, COOLING & AIR",
        items: [
          "Air Conditioners",
          "Standing & Ceiling Fans",
          "Rechargeable Solar Fans",
          "Air Purifiers & Humidifiers",
        ],
      },
    ],
  },
  {
    id: "electronics",
    name: "Electronics",
    icon: Radio,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "TELEVISION & VIDEO",
        items: [
          "Smart TVs (32\" - 65\")",
          "Home Theatre Systems",
          "Soundbars & Subwoofers",
          "TV Wall Brackets",
          "Satellite Decoders",
        ],
      },
      {
        title: "AUDIO & SOUND",
        items: [
          "JBL & Oraimo Bluetooth Speakers",
          "Wireless Boomboxes",
          "Radio Sets",
          "Karaoke Microphones",
        ],
      },
      {
        title: "SOLAR & POWER BACKUP",
        items: [
          "Solar Inverter Systems",
          "Solar Panels",
          "Extension Boards & Surge Protectors",
          "Emergency Lighting",
        ],
      },
    ],
  },
  {
    id: "computing",
    name: "Computing",
    icon: Laptop,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "COMPUTER ACCESSORIES",
        items: [
          "Wireless Keyboards and Mice",
          "Printers, Ink & Toner",
          "UPS & Power Strips",
          "Flash Drives & Memory Cards",
          "External Hard Drives (1TB - 4TB)",
          "Laptop Bags & Stands",
        ],
      },
      {
        title: "LAPTOPS",
        items: [
          "HP Laptops",
          "Dell Laptops",
          "Apple MacBooks",
          "Lenovo Laptops",
          "Asus Laptops",
          "Acer Laptops",
        ],
      },
      {
        title: "NETWORKING",
        items: [
          "Wi-Fi Routers",
          "4G Portable MiFi",
          "Ethernet Cables & Switches",
          "Wi-Fi Extenders",
        ],
      },
    ],
  },
  {
    id: "fashion",
    name: "Fashion",
    icon: Shirt,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "TRADITIONAL NORTHERN WEAR",
        items: [
          "Handwoven Dagbon Smocks (Fugu)",
          "Northern Batakari",
          "Traditional Chieftaincy Smocks",
          "Woven Strip Cloth (Kparigu)",
        ],
      },
      {
        title: "MEN'S FASHION",
        items: [
          "Shirts & Polos",
          "Trousers & Chinos",
          "Kaftans & Jalabias",
          "Sneakers & Leather Shoes",
          "Handmade Leather Sandals",
        ],
      },
      {
        title: "WOMEN'S FASHION",
        items: [
          "Modern African Dresses",
          "Northern Print Wax Fabrics",
          "Handbags & Clutches",
          "Slippers & Heels",
        ],
      },
    ],
  },
  {
    id: "local-crafts",
    name: "Crafts & Shea",
    icon: Package,
    color: "text-slate-600 group-hover:text-amber-600",
    badge: "Northern",
    groups: [
      {
        title: "DAGBON HERITAGE CRAFTS",
        items: [
          "Handcrafted Talking Drums (Luna)",
          "Calabash Bowls & Gourds",
          "Woven Straw Baskets & Hats",
          "Tamale Leather Slippers",
        ],
      },
      {
        title: "TAMALE LOCAL FOODS",
        items: [
          "Authentic Dawadawa (Cakes & Powder)",
          "Pure Savannah Raw Honey",
          "Northern Yellow Yams",
          "Groundnut & Sesame Paste",
        ],
      },
    ],
  },
  {
    id: "groceries",
    name: "Groceries",
    icon: ShoppingBasket,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "GRAINS & TUBERS",
        items: [
          "Tamale Local Rice",
          "White & Water Yams",
          "Maize & Sorghum",
          "Millet & Cowpeas (Beans)",
          "Crispy Gari",
        ],
      },
      {
        title: "OILS & SPICES",
        items: [
          "Authentic Suya Pepper (Yaji)",
          "Pure Shea Cooking Butter",
          "Ginger & Garlic Powder",
          "Pre-packaged Spices",
        ],
      },
    ],
  },
  {
    id: "sports",
    name: "Sporting Goods",
    icon: Trophy,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "FOOTBALL & KITS",
        items: [
          "Ghana Black Stars Jerseys",
          "Club Football Kits",
          "Match Footballs",
          "Boots & Shin Guards",
        ],
      },
      {
        title: "FITNESS & GYM",
        items: [
          "Dumbbells & Kettlebells",
          "Resistance Bands",
          "Skipping Ropes",
          "Yoga & Workout Mats",
        ],
      },
    ],
  },
  {
    id: "baby-products",
    name: "Baby Products",
    icon: Baby,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "DIAPERING & NURSING",
        items: [
          "Baby Diapers & Wipes",
          "Feeding Bottles & Warmers",
          "Baby Formula & Cereals",
          "Gentle Baby Lotions",
        ],
      },
      {
        title: "BABY GEAR & TOYS",
        items: [
          "Baby Strollers",
          "Cots & Mosquito Net Tents",
          "Teethers & Educational Toys",
          "Baby Carrier Slings",
        ],
      },
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: Gamepad2,
    color: "text-slate-600 group-hover:text-amber-600",
    groups: [
      {
        title: "CONSOLES & GEAR",
        items: [
          "PlayStation 5 Consoles",
          "PlayStation 4 Consoles",
          "Wireless Controllers",
          "Gaming Headsets",
        ],
      },
      {
        title: "VIDEO GAMES",
        items: [
          "EA FC 25 / FIFA Discs",
          "Action & Adventure Games",
          "Racing & Sports Games",
        ],
      },
    ],
  },
];

interface MegaCategoryNavProps {
  onSelectCategory?: (categoryName: string) => void;
  onSelectSubcategory?: (subName: string, categoryName: string) => void;
  activeCategory?: string;
}

export default function MegaCategoryNav({
  onSelectCategory,
  onSelectSubcategory,
  activeCategory,
}: MegaCategoryNavProps) {
  const [hoveredCategory, setHoveredCategory] = useState<MegaCategory | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (cat: MegaCategory) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredCategory(cat);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 200);
  };

  return (
    <div
      className="hidden md:block relative bg-white border-b border-slate-200/80 shadow-xs select-none z-20"
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Horizontal Category Lineup with clean monochrome icons matching Jumia reference */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none py-1.5 text-xs font-semibold text-slate-700">
          {MEGA_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isHovered = hoveredCategory?.id === cat.id;
            const isSelected = activeCategory === cat.name;

            return (
              <div
                key={cat.id}
                onMouseEnter={() => handleMouseEnter(cat)}
                className="relative shrink-0"
              >
                <button
                  type="button"
                  onClick={() => onSelectCategory?.(cat.name)}
                  className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
                    isHovered || isSelected
                      ? "text-amber-600 bg-amber-50/80 font-bold"
                      : "text-slate-600 hover:text-amber-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-transform duration-150 group-hover:scale-110 ${
                      isHovered || isSelected ? "text-amber-600 stroke-[2.2]" : "text-slate-500 group-hover:text-amber-600"
                    }`}
                  />
                  <span className="whitespace-nowrap tracking-tight">{cat.name}</span>
                  {cat.badge && (
                    <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md">
                      {cat.badge}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          <Link
            href="/categories"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 rounded-xl hover:bg-slate-50 transition shrink-0"
          >
            <span>All Categories</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* MEGA-MENU DROPDOWN PANEL */}
      {hoveredCategory && (
        <div
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full inset-x-0 bg-white border-b border-slate-200/90 shadow-elevated z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            {/* Mega Menu Top Category Banner */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-800">
                  <hoveredCategory.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    {hoveredCategory.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Explore available local products in Tamale
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectCategory?.(hoveredCategory.name);
                  setHoveredCategory(null);
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <span>View all in {hoveredCategory.name}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Subcategories Multi-Column Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {hoveredCategory.groups.map((group, gIdx) => (
                <div key={gIdx} className="space-y-2.5">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-100">
                    {group.title}
                  </h4>

                  <ul className="space-y-1.5">
                    {group.items.map((item, iIdx) => (
                      <li key={iIdx}>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSubcategory?.(item, hoveredCategory.name);
                            setHoveredCategory(null);
                          }}
                          className="text-xs text-slate-600 hover:text-amber-600 hover:translate-x-1 font-medium transition-all duration-150 text-left block w-full truncate py-0.5"
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
