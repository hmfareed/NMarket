import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Order } from "@/models/Order";
import { Delivery } from "@/models/Delivery";
import { Store } from "@/models/Store";
import bcrypt from "bcryptjs";

try {
  process.loadEnvFile?.(".env.local");
} catch {
  // Ignore if not present
}

async function main() {
  await connectToDatabase();
  console.log("Connected to database for fleet seeding...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Seed / ensure 3 diverse verified Tamale riders
  const riderDefs = [
    {
      email: "haruna.rider@nmarket.gh",
      phone: "0241122334",
      firstName: "Haruna",
      lastName: "Iddrisu",
      vehicleType: "MOTORCYCLE" as const,
      licensePlate: "M-24-NR-8821",
      operatingZone: "Tamale Central (Zone 1)",
      isOnline: true,
      rating: 4.9,
      totalCompletedDeliveries: 42,
      currentEarnings: 420,
    },
    {
      email: "salifu.rider@nmarket.gh",
      phone: "0247654321",
      firstName: "Salifu",
      lastName: "Alhassan",
      vehicleType: "TRICYCLE" as const,
      licensePlate: "M-23-NR-4190",
      operatingZone: "Lamashegu & Sakasaka",
      isOnline: true,
      rating: 4.8,
      totalCompletedDeliveries: 28,
      currentEarnings: 280,
    },
    {
      email: "yakubu.rider@nmarket.gh",
      phone: "0249876543",
      firstName: "Yakubu",
      lastName: "Issah",
      vehicleType: "MOTORCYCLE" as const,
      licensePlate: "M-24-NR-1055",
      operatingZone: "Nyankpala & Sagnarigu",
      isOnline: false,
      rating: 5.0,
      totalCompletedDeliveries: 15,
      currentEarnings: 150,
    },
  ];

  const riderDocs: any[] = [];
  for (const r of riderDefs) {
    let user = await User.findOne({ email: r.email });
    if (!user) {
      user = await User.create({
        email: r.email,
        phone: r.phone,
        passwordHash,
        role: "RIDER",
        status: "ACTIVE",
        isEmailVerified: true,
        isPhoneVerified: true,
        customerProfile: {
          firstName: r.firstName,
          lastName: r.lastName,
        },
        riderProfile: {
          vehicleType: r.vehicleType,
          licensePlate: r.licensePlate,
          ghanaCardNumber: `GHA-${Math.floor(100000000 + Math.random() * 900000000)}-1`,
          operatingZone: r.operatingZone,
          isOnline: r.isOnline,
          currentEarnings: r.currentEarnings,
          totalCompletedDeliveries: r.totalCompletedDeliveries,
          rating: r.rating,
        },
      });
      console.log(`Created rider: ${r.firstName} ${r.lastName} (${r.phone})`);
    } else {
      user.role = "RIDER";
      user.status = "ACTIVE";
      user.riderProfile = {
        vehicleType: r.vehicleType,
        licensePlate: r.licensePlate,
        ghanaCardNumber: user.riderProfile?.ghanaCardNumber || "GHA-789123456-1",
        operatingZone: r.operatingZone,
        isOnline: r.isOnline,
        currentEarnings: r.currentEarnings,
        totalCompletedDeliveries: r.totalCompletedDeliveries,
        rating: r.rating,
      };
      await user.save();
      console.log(`Updated rider: ${r.firstName} ${r.lastName}`);
    }
    riderDocs.push(user);
  }

  // 2. Find or create a test customer user for deliveries
  let customer = await User.findOne({ role: "CUSTOMER" });
  if (!customer) {
    customer = await User.create({
      email: "aminu.customer@nmarket.gh",
      phone: "0245566778",
      passwordHash,
      role: "CUSTOMER",
      status: "ACTIVE",
      isEmailVerified: true,
      isPhoneVerified: true,
      customerProfile: { firstName: "Aminu", lastName: "Bawumia" },
    });
  }

  // 3. Find or create a merchant store
  let store = await Store.findOne();
  if (!store) {
    store = await Store.create({
      name: "Tamale Central Provisions Hub",
      slug: "tamale-central-provisions",
      sellerId: customer._id,
      phone: "0241112233",
      businessType: "RETAIL",
      verificationStatus: "VERIFIED",
      address: {
        region: "Northern Region",
        city: "Tamale",
        area: "Tamale Central",
        pickupAddress: "Opposite Central Mosque, Commercial Street",
        landmark: "Central Mosque",
      },
    });
  }

  // 4. Seed realistic active, pending, and delivered delivery jobs
  const sampleDeliverySpecs = [
    {
      orderNumber: "NM-10492",
      sellerOrderId: "NM-10492-A",
      riderIndex: 0, // Haruna
      status: "ACCEPTED" as const,
      storeName: store.name,
      pickupArea: "Tamale Central",
      pickupAddress: "Opposite Central Mosque",
      recipient: "Ibrahim Fuseini",
      recipientPhone: "0244112233",
      dropoffArea: "Sagnarigu",
      dropoffAddress: "Near Sagnarigu Chief Palace",
      landmark: "Old Water Tank",
      deliveryFee: 15,
      deliveryOtp: "4829",
      assignedAt: new Date(Date.now() - 25 * 60 * 1000),
      notes: "Customer requested quick dropoff before Zuhr prayer",
    },
    {
      orderNumber: "NM-10491",
      sellerOrderId: "NM-10491-A",
      riderIndex: 1, // Salifu
      status: "PICKED_UP" as const,
      storeName: "Aboabo Grains & Spices",
      pickupArea: "Aboabo Market",
      pickupAddress: "Lane 4, Spices Shed",
      recipient: "Faiza Mohammed",
      recipientPhone: "0209988776",
      dropoffArea: "Lamashegu",
      dropoffAddress: "House No. B24, Lamashegu Residential",
      landmark: "Near Lamashegu Clinic",
      deliveryFee: 12,
      deliveryOtp: "1934",
      assignedAt: new Date(Date.now() - 40 * 60 * 1000),
      pickedUpAt: new Date(Date.now() - 15 * 60 * 1000),
      notes: "Handle fragile glass spice jars with care",
    },
    {
      orderNumber: "NM-10490",
      sellerOrderId: "NM-10490-A",
      riderIndex: null, // PENDING_DISPATCH - for admin testing!
      status: "PENDING_DISPATCH" as const,
      storeName: store.name,
      pickupArea: "Tamale Central",
      pickupAddress: "Commercial Street",
      recipient: "Kwame Antwi",
      recipientPhone: "0556677889",
      dropoffArea: "Sakasaka",
      dropoffAddress: "Plot 12, Sakasaka High Street",
      landmark: "Sakasaka Primary School",
      deliveryFee: 10,
      deliveryOtp: "8204",
      notes: "Call customer upon arrival at primary school junction",
    },
    {
      orderNumber: "NM-10489",
      sellerOrderId: "NM-10489-A",
      riderIndex: null, // PENDING_DISPATCH - for admin testing!
      status: "PENDING_DISPATCH" as const,
      storeName: "Sakasaka Tech Store",
      pickupArea: "Sakasaka",
      pickupAddress: "Roundabout Plaza, Shop 3",
      recipient: "Rashida Yakubu",
      recipientPhone: "0243322110",
      dropoffArea: "Vittin Estates",
      dropoffAddress: "Block C, Vittin Barrier Road",
      landmark: "Vittin Police Barrier",
      deliveryFee: 18,
      deliveryOtp: "6512",
      notes: "Gate code #4421",
    },
    {
      orderNumber: "NM-10488",
      sellerOrderId: "NM-10488-A",
      riderIndex: 0, // Haruna
      status: "DELIVERED" as const,
      storeName: store.name,
      pickupArea: "Tamale Central",
      pickupAddress: "Commercial Street",
      recipient: "Alhaji Baba Seidu",
      recipientPhone: "0240099887",
      dropoffArea: "Nyankpala",
      dropoffAddress: "UDS Campus Gate 2",
      landmark: "UDS Main Library",
      deliveryFee: 20,
      deliveryOtp: "7731",
      assignedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      pickedUpAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      notes: "Delivered directly to staff quarters with OTP verification",
    },
  ];

  for (const spec of sampleDeliverySpecs) {
    // Check if order exists or create lightweight order
    let order = await Order.findOne({ orderNumber: spec.orderNumber });
    if (!order) {
      order = await Order.create({
        orderNumber: spec.orderNumber,
        customerId: customer._id,
        deliveryOtp: spec.deliveryOtp,
        fulfillmentType: "LOCAL_DELIVERY",
        status: spec.status === "DELIVERED" ? "COMPLETED" : "PROCESSING",
        payment: {
          provider: "MTN_MOMO",
          amount: 150,
          currency: "GHS",
          status: "SUCCESS",
        },
        shippingAddress: {
          recipient: spec.recipient,
          phone: spec.recipientPhone,
          region: "Northern Region",
          city: "Tamale",
          area: spec.dropoffArea,
          streetAddress: spec.dropoffAddress,
          landmark: spec.landmark,
          deliveryInstructions: spec.notes,
        },
        sellerOrders: [
          {
            sellerOrderId: spec.sellerOrderId,
            storeId: store._id,
            storeName: spec.storeName,
            sellerId: store.sellerId,
            status: spec.status === "DELIVERED" ? "COMPLETED" : "PROCESSING",
            items: [
              {
                productId: customer._id, // placeholder
                name: "Tamale Local Provisions Bundle",
                unitPrice: 135,
                quantity: 1,
                totalPrice: 135,
              },
            ],
            subtotal: 135,
            deliveryFee: spec.deliveryFee,
            commissionAmount: 6.75,
            sellerEarning: 128.25,
            prepTimeMinutes: 25,
          },
        ],
        totalProductAmount: 135,
        totalDeliveryFee: spec.deliveryFee,
        totalAmount: 135 + spec.deliveryFee,
        deliveredAt: (spec as any).deliveredAt,
      });
    }

    // Upsert Delivery record
    const assignedRider = spec.riderIndex !== null ? riderDocs[spec.riderIndex] : null;

    let delivery = await Delivery.findOne({ orderNumber: spec.orderNumber });
    if (!delivery) {
      delivery = await Delivery.create({
        orderId: order._id,
        orderNumber: spec.orderNumber,
        sellerOrderId: spec.sellerOrderId,
        riderId: assignedRider?._id,
        pickupLocation: {
          storeName: spec.storeName,
          area: spec.pickupArea,
          address: spec.pickupAddress,
          phone: "0241112233",
        },
        dropoffLocation: {
          recipient: spec.recipient,
          phone: spec.recipientPhone,
          area: spec.dropoffArea,
          address: spec.dropoffAddress,
          landmark: spec.landmark,
          deliveryInstructions: spec.notes,
        },
        status: spec.status,
        deliveryFee: spec.deliveryFee,
        deliveryOtp: spec.deliveryOtp,
        assignedAt: (spec as any).assignedAt,
        pickedUpAt: (spec as any).pickedUpAt,
        deliveredAt: (spec as any).deliveredAt,
        notes: spec.notes,
      });
      console.log(`Created delivery: ${spec.orderNumber} [${spec.status}] -> ${spec.dropoffArea}`);
    } else {
      delivery.status = spec.status;
      if (assignedRider) delivery.riderId = assignedRider._id;
      delivery.deliveryOtp = spec.deliveryOtp;
      delivery.assignedAt = (spec as any).assignedAt;
      delivery.pickedUpAt = (spec as any).pickedUpAt;
      delivery.deliveredAt = (spec as any).deliveredAt;
      await delivery.save();
      console.log(`Updated delivery: ${spec.orderNumber} [${spec.status}]`);
    }
  }

  console.log("\nFleet & Deliveries successfully seeded!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fleet seeding error:", err);
  process.exit(1);
});
