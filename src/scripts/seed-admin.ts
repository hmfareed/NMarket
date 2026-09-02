import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

async function main() {
  await connectToDatabase();

  const email = "admin@nmarket.gh";
  const passwordHash = await bcrypt.hash("AdminPass123!", 10);

  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      email,
      phone: "0240000001",
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      isEmailVerified: true,
      isPhoneVerified: true,
      customerProfile: {
        firstName: "Super",
        lastName: "Admin",
      },
    });
    console.log("Created Super Admin:", email);
  } else {
    admin.role = "SUPER_ADMIN";
    admin.status = "ACTIVE";
    admin.passwordHash = passwordHash;
    await admin.save();
    console.log("Updated Super Admin to SUPER_ADMIN role:", email);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Failed to seed admin:", err);
  process.exit(1);
});
