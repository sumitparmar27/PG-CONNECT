require("dotenv").config();
const connectDB = require("../src/config/db");
const Pg = require("../src/models/Pg.model");

async function backfill() {
  await connectDB();

  const result = await Pg.updateMany(
    { moderationStatus: { $exists: false } },
    { $set: { moderationStatus: "approved" } },
  );

  console.log(`Backfilled moderationStatus=approved on ${result.modifiedCount} existing PG(s)`);
  process.exit(0);
}

backfill().catch((err) => {
  console.error("Failed to backfill PG moderation status:", err.message);
  process.exit(1);
});
