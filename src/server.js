const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const paymentRoutes = require("../routes/paymentRoutes");

// Make sure express() is called to initialize the app instance
const app = express();

const clientUrl = (process.env.CLIENT_URL || "https://dara-hair-website.vercel.app").replace(/\/$/, "");

const corsOptions = {
  origin: clientUrl,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Global CORS middleware
app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Dara Hair Payment Server is running",
  });
});

app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Payment server running on port ${PORT}`);
});