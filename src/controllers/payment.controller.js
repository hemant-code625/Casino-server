import crypto from "crypto";
import Razorpay from "razorpay";

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  const { amt } = req.body;
  if (amt < 100) {
    return res.status(400).json({
      error: "Minimum amount that you can add in your wallet is Rs. 100",
    });
  }
  const options = {
    amount: amt * 100, // amount in paise
    currency: "INR",
    receipt: "receipt#1",
  };
  try {
    const order = await instance.orders.create(options); // Create an order object
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

//  Verify the payment signature
export const verifyPayment = async (req, res) => {
  const { payment_id, order_id, signature } = req.body;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const generated_signature = crypto
    .createHmac("sha256", secret)
    .update(`${order_id}|${payment_id}`)
    .digest("hex");

  if (generated_signature === signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
};

// To withdraw money from the user's wallet
export const createPayout = async (req, res) => {
  const { payout } = req.body;
  const options = {
    amount: payout * 100, // amount in paise
    currency: "INR",
    mode: "IMPS",
    receipt: "receipt#1",
    account_number: "YOUR_USER_ACCOUNT_NUMBER",
    ifsc_code: "YOUR_USER_IFSC_CODE",
    fund_account: "YOUR_USER_FUND_ACCOUNT_ID",
  };
  try {
    const payout = await instance.payouts.create(options); // Create a payout object
    res.json(payout);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Ensure your integration complies with PCI-DSS standards for handling payment information securely.
