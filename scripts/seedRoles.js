require("dotenv").config();
const connectDB = require("../src/config/db");
const roleService = require("../src/services/role.service");

async function seed() {
  await connectDB();
  await roleService.ensureDefaultRoles();
  console.log("Default roles seeded: user, admin");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed roles:", err.message);
  process.exit(1);
});
