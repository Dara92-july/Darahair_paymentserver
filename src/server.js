const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const paymentRoutes = require("../routes/paymentRoutes");

const app = express;

// Use the payment API URL from env, fallback to default
const paymentApiUrl = process.env.PAYMENT_API_URL || "https://darahair-payment-server.onrender.com";
const clientUrl = process.env.CLIENT_URL || new URL(paymentApiUrl).origin;

const corsOptions = {
  origin: clientUrl,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Global CORS middleware handles both preflight (OPTIONS) and standard requests
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