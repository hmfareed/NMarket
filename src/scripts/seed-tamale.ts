import mongoose from "mongoose";
import { DeliveryZone } from "../models/DeliveryZone";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nmarket";

// GeoJSON coordinates for Tamale zones [lng, lat]
const tamaleZones = [
  {
    name: "Tamale Central (Zone 1)",
    slug: "tamale-central",
    region: "Northern Region",
    city: "Tamale",
    baseFee: 20.0,
    estimatedTimeMinutes: 90,
    estimatedTimeText: "1–3 hours",
    boundary: {
      type: "Polygon" as const,
      coordinates: [
        [
          [-0.865, 9.385],
          [-0.825, 9.385],
          [-0.815, 9.425],
          [-0.855, 9.435],
          [-0.875, 9.405],
          [-0.865, 9.385],
        ],
      ],
    },
    isActive: true,
  },
  {
    name: "Tamale Outer & Sagnarigu (Zone 2)",
    slug: "tamale-outer",
    region: "Northern Region",
    city: "Tamale",
    baseFee: 30.0,
    estimatedTimeMinutes: 240,
    estimatedTimeText: "Same day (3–5 hours)",
    boundary: {
      type: "Polygon" as const,
      coordinates: [
        [
          [-0.910, 9.350],
          [-0.780, 9.350],
          [-0.780, 9.470],
          [-0.910, 9.470],
          [-0.910, 9.350],
        ],
      ],
    },
    isActive: true,
  },
];

async function seed() {
  console.log("Connecting to MongoDB at:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB successfully.");

  console.log("Seeding Tamale Delivery Zones...");
  for (const zone of tamaleZones) {
    const existing = await DeliveryZone.findOne({ slug: zone.slug });
    if (existing) {
      console.log(`Zone '${zone.name}' already exists. Updating...`);
      await DeliveryZone.updateOne({ slug: zone.slug }, zone);
    } else {
      await DeliveryZone.create(zone);
      console.log(`Created delivery zone: ${zone.name}`);
    }
  }

  console.log("Tamale location & zone seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
