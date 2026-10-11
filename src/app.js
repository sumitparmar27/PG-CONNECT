const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const pgRoutes = require("./routes/pg.routes");
const pgTypeRoutes = require("./routes/pgType.routes");
const roomRoutes = require("./routes/room.routes");
const bookingRoutes = require("./routes/booking.routes");
const webhookRoutes = require("./routes/webhook.routes");
const adminRoutes = require("./routes/admin.routes");
const { notFound, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.use(cors());

// Mounted before express.json() because Razorpay's webhook signature is computed
// over the raw request bytes; this route parses its own body as a Buffer.
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/pgs", pgRoutes);
app.use("/api/pg-types", pgTypeRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

const clientDistDir = path.join(__dirname, "..", "client", "dist");
const clientIndexHtml = path.join(clientDistDir, "index.html");
const clientIsBuilt = fs.existsSync(clientIndexHtml);

if (clientIsBuilt) {
  app.use(express.static(clientDistDir));

  // SPA fallback: any non-API GET request gets the built React app.
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(clientIndexHtml);
  });
} else {
  app.get("/", (req, res) => {
    res.send(
      "Backend Server is Running! (client not built yet — run `npm run build`, or `npm run dev` for the Vite dev server)",
    );
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
