const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const paymentRoutes = require("../routes/paymentRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://dara-hair-website.vercel.app",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

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