"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultAdmin = void 0;
const User_1 = require("../models/User");
const User_2 = require("../models/User");
const createDefaultAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminFullname = process.env.ADMIN_FULLNAME;
        if (!adminEmail || !adminFullname) {
            console.warn("Admin env variables not set");
            return;
        }
        const existingAdmin = await User_1.User.findOne({ email: adminEmail });
        if (existingAdmin) {
            // 🟢 දැනටමත් Admin ඉන්නවා නම්, හැබැයි role එක PLAYER වෙලා නම් ඒක ADMIN කරනවා.
            if (existingAdmin.role !== User_2.Role.ADMIN) {
                await User_1.User.updateOne({ email: adminEmail }, { $set: { role: User_2.Role.ADMIN } } // roles නෙමෙයි role
                );
                console.log("🟢 Updated existing user to ADMIN role");
            }
            else {
                console.log("🟢 Default admin already exists and has ADMIN role");
            }
            return;
        }
        // 🟢 අලුත්ම Admin කෙනෙක් හදනවා නම්
        await User_1.User.create({
            fullname: adminFullname,
            email: adminEmail,
            role: User_2.Role.ADMIN, // ❌ මෙතන 'roles: [Role.ADMIN]' තිබුණේ. ඒක 'role: Role.ADMIN' වෙන්න ඕනේ.
            status: User_2.Status.ACTIVE // Status කියන එකේ S අකුර simple වෙන්න ඕනේ (status)
        });
        console.log("🟢 Default admin user created successfully");
    }
    catch (error) {
        console.error("Error creating default admin:", error);
    }
};
exports.createDefaultAdmin = createDefaultAdmin;
