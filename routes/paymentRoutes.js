const express = require("express");

const paystackService = require("../services/paystackService");

const {
  db,
  FieldValue,
} = require("../config/firebaseAdmin");

const router = express.Router();

// =====================================================
// INITIALIZE PAYMENT
// =====================================================

router.post("/initialize", async (req, res) => {
  try {
    const {
      email,
      amount,
      reference,
      callback_url,
    } = req.body;

    // Validate required fields
    if (!email || !amount || !reference) {
      return res.status(400).json({
        message:
          "Email, amount and reference are required",
      });
    }

    // Initialize transaction with Paystack
    const result =
      await paystackService.initializeTransaction({
        email,
        amount,
        reference,
        callback_url,
      });

    res.status(200).json(result);
  } catch (error) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Unable to initialize payment",
    });
  }
});

// =====================================================
// VERIFY PAYMENT
// =====================================================

router.get("/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    // =================================================
    // VERIFY PAYMENT WITH PAYSTACK
    // =================================================

    const result =
      await paystackService.verifyTransaction(
        reference
      );

    const paymentData = result?.data;

    if (!paymentData) {
      return res.status(400).json({
        message:
          "Invalid payment response from Paystack",
      });
    }

    // =================================================
    // CHECK PAYMENT STATUS
    // =================================================

    if (paymentData.status !== "success") {
      return res.status(400).json({
        message: "Payment was not successful",
        status: paymentData.status,
      });
    }

    // =================================================
    // FIND ORDER IN FIRESTORE
    // =================================================

    const ordersSnapshot = await db
      .collection("orders")
      .where(
        "paymentReference",
        "==",
        reference
      )
      .limit(1)
      .get();

    if (ordersSnapshot.empty) {
      return res.status(404).json({
        message:
          "Payment was successful, but the order could not be found.",
      });
    }

    const orderDoc = ordersSnapshot.docs[0];

    const orderData = orderDoc.data();

    // =================================================
    // PREVENT DUPLICATE PROCESSING
    // =================================================

    if (orderData.paymentStatus === "paid") {
      return res.status(200).json({
        status: true,

        message: "Payment already verified",

        data: {
          ...paymentData,

          orderId: orderDoc.id,

          orderNumber:
            orderData.orderNumber,

          paymentStatus: "paid",
        },
      });
    }

    // =================================================
    // VERIFY PAYMENT AMOUNT
    // =================================================

    const expectedAmount = Math.round(
      Number(orderData.amount) * 100
    );

    const paidAmount = Number(
      paymentData.amount
    );

    if (paidAmount !== expectedAmount) {
      console.error(
        "Payment amount mismatch:",
        {
          orderId: orderDoc.id,
          expectedAmount,
          paidAmount,
        }
      );

      return res.status(400).json({
        message:
          "Payment amount does not match the order amount.",
      });
    }

    // =================================================
    // UPDATE FIRESTORE ORDER
    // =================================================

    await db
      .collection("orders")
      .doc(orderDoc.id)
      .update({
        paymentStatus: "paid",

        orderStatus: "pending",

        paidAt:
          FieldValue.serverTimestamp(),

        updatedAt:
          FieldValue.serverTimestamp(),

        paystackTransactionId:
          paymentData.id,

        paymentChannel:
          paymentData.channel || null,
      });

    // =================================================
    // RETURN SUCCESS
    // =================================================

    res.status(200).json({
      status: true,

      message:
        "Payment verified successfully",

      data: {
        orderId: orderDoc.id,

        orderNumber:
          orderData.orderNumber,

        paymentStatus: "paid",

        transactionReference:
          paymentData.reference,

        amount:
          paymentData.amount,

        channel:
          paymentData.channel,
      },
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.response?.data ||
        error.message
    );

    res.status(500).json({
      message:
        "Unable to verify payment",
    });
  }
});

module.exports = router;