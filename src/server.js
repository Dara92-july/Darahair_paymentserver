const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const paymentRoutes = require("../routes/paymentRoutes");

const app = express();

const corsOptions = {
  origin: "https://dara-hair-website.vercel.app",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Dara Hair Payment Server is running",
  });
});

app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Payment server running on port ${PORT}`);
});