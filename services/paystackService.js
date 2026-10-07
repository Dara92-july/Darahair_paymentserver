const axios = require("axios");

const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

const paystackService = {
  initializeTransaction: async ({
    email,
    amount,
    reference,
    callback_url,
  }) => {
    const response = await paystack.post("/transaction/initialize", {
      email,
      amount,
      reference,
      callback_url,
      currency: "NGN",
    });

    return response.data;
  },

  verifyTransaction: async (reference) => {
    const response = await paystack.get(
      `/transaction/verify/${reference}`
    );

    return response.data;
  },
};

module.exports = paystackService;