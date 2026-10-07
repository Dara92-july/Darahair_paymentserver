
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");dotenv.config();


const paymentRoutes = require("../routes/paymentRoutes");



const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
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