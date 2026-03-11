import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
// Cashfree credentials
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY =process.env.CASHFREE_CLIENT_SECRET;

const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg";

// ================= CREATE PAYMENT =================

export const createpayment = async (req, res) => {
  try {

    const { orderid, orderamount, ordercurrency, customerdetail } = req.body;

    if (!orderid || !orderamount || !ordercurrency || !customerdetail) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment fields",
      });
    }

    const response = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: orderid,
        order_amount: orderamount,
        order_currency: ordercurrency,

        customer_details: customerdetail,

        order_meta: {
          return_url: `https://ecombackend-jdqm.onrender.com/payment-success?order_id=${orderid}`,
        },
      },
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      data: response.data,
    });

  } catch (error) {

    console.log("Payment Creation Error:", error.response?.data || error);

    res.status(500).json({
      success: false,
      message: "Payment creation failed",
      error: error.message,
    });

  }
};

// ================= VERIFY PAYMENT =================

export const paymentSuccessHandler = async (req, res) => {

  const orderid = req.query.order_id;

  if (!orderid) {
    return res.status(400).send("Missing order_id");
  }

  try {

    const response = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${orderid}`,
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
        },
      }
    );

    console.log("Cashfree Order Status:", response.data);

    if (response.data?.order_status === "PAID") {

      // Payment successful → redirect to frontend success page
      return res.redirect("https://elegant-dolphin-85cb1e.netlify.app/payment-success");

    } else {

      return res.redirect("https://elegant-dolphin-85cb1e.netlify.app/payment-failed");

    }

  } catch (error) {

    console.log("Payment Verification Error:", error.response?.data || error);

    return res.status(500).send("Error verifying payment.");

  }

};
