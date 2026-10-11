require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const roleService = require("./src/services/role.service");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => roleService.ensureDefaultRoles())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
