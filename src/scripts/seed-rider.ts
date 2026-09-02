import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

async function main() {
  await connectToDatabase();

  const email = "rider@nmarket.gh";
  const passwordHash = await bcrypt.hash("Password123!", 10);

  let rider = await User.findOne({ email });
  if (!rider) {
    rider = await User.create({
      email,
      phone: "0501234567",
      passwordHash,
      role: "RIDER",
      status: "ACTIVE",
      isEmailVerified: true,
      isPhoneVerified: true,
      customerProfile: {
        firstName: "Haruna",
        lastName: "Iddrisu",
      },
      riderProfile: {
        vehicleType: "MOTORCYCLE",
        licensePlate: "M-24-NR-8821",
        ghanaCardNumber: "GHA-789123456-1",
        operatingZone: "Tamale Central (Zone 1)",
        isOnline: true,
        currentEarnings: 0,
        totalCompletedDeliveries: 0,
        rating: 5.0,
      },
    });
    console.log("Created verified rider:", email);
  } else {
    rider.role = "RIDER";
    rider.status = "ACTIVE";
    rider.passwordHash = passwordHash;
    rider.riderProfile = {
      vehicleType: "MOTORCYCLE",
      licensePlate: "M-24-NR-8821",
      ghanaCardNumber: "GHA-789123456-1",
      operatingZone: "Tamale Central (Zone 1)",
      isOnline: true,
      currentEarnings: 0,
      totalCompletedDeliveries: 0,
      rating: 5.0,
    };
    await rider.save();
    console.log("Updated verified rider:", email);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to seed rider:", err);
  process.exit(1);
});
