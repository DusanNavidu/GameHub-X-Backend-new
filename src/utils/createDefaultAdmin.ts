import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Role, Status } from "../models/User";

export const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminFullname = process.env.ADMIN_FULLNAME;

    if (!adminEmail || !adminFullname) {
      console.warn("Admin env variables not set");
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      // 🟢 දැනටමත් Admin ඉන්නවා නම්, හැබැයි role එක PLAYER වෙලා නම් ඒක ADMIN කරනවා.
      if (existingAdmin.role !== Role.ADMIN) {
        await User.updateOne(
          { email: adminEmail },
          { $set: { role: Role.ADMIN } } // roles නෙමෙයි role
        );
        console.log("🟢 Updated existing user to ADMIN role");
      } else {
        console.log("🟢 Default admin already exists and has ADMIN role");
      }
      return;
    }

    // 🟢 අලුත්ම Admin කෙනෙක් හදනවා නම්
    await User.create({
      fullname: adminFullname,
      email: adminEmail,
      role: Role.ADMIN, // ❌ මෙතන 'roles: [Role.ADMIN]' තිබුණේ. ඒක 'role: Role.ADMIN' වෙන්න ඕනේ.
      status: Status.ACTIVE // Status කියන එකේ S අකුර simple වෙන්න ඕනේ (status)
    });

    console.log("🟢 Default admin user created successfully");
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};