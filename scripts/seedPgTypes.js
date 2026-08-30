require("dotenv").config();
const connectDB = require("../src/config/db");
const PgType = require("../src/models/PgType.model");

const DEFAULT_TYPES = ["Boys PG", "Girls PG", "Co-living", "Family Sharing"];

async function seed() {
  await connectDB();

  for (const name of DEFAULT_TYPES) {
    await PgType.updateOne({ name }, { name }, { upsert: true });
  }

  console.log(`PG types seeded: ${DEFAULT_TYPES.join(", ")}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed PG types:", err.message);
  process.exit(1);
});
