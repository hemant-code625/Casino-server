import crypto from "crypto";
import Razorpay from "razorpay";
import axios from "axios";

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
// export const createPayout = async (req, res) => {
//   const { payout } = req.body;
//   const options = {
//     amount: payout * 100, // amount in paise
//     currency: "INR",
//     mode: "IMPS",
//     receipt: "receipt#1",
//     account_number: "YOUR_USER_ACCOUNT_NUMBER",
//     ifsc_code: "YOUR_USER_IFSC_CODE",
//     fund_account: "YOUR_USER_FUND_ACCOUNT_ID",
//   };
//   try {
//     // const payout = await instance.payouts.create(options); // Create a payout object
//     const transfer = await instance.transfers.create({
//       account: process.env.USER_ACCOUNT,
//       amount: payout * 100,
//       currency: "INR",
//       mode: "IMPS",
//     });
//     res.json(transfer);
//   } catch (error) {
//     res.status(500).json(error);
//   }
// };

// export const createPayout0 = async (req, res) => {
//   const { payout } = req.body;

//   try {
//     // Step 1: Create a Contact (same as before)
//     const contactOptions = {
//       name: "John Doe",
//       email: "johndoe@example.com",
//       contact: "9999999999",
//       type: "customer",
//     };

//     const contactResponse = await axios.post(
//       "https://api.razorpay.com/v1/contacts",
//       contactOptions,
//       {
//         auth: {
//           username: process.env.RAZORPAY_KEY_ID,
//           password: process.env.RAZORPAY_KEY_SECRET,
//         },
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const contactId = contactResponse.data.id;

//     // Step 2: Create a Fund Account
//     const fundAccountOptions = {
//       contact_id: contactId,
//       account_type: "bank_account",
//       bank_account: {
//         name: "John Doe",
//         ifsc: "HDFC0001234",
//         account_number: "1234567890",
//       },
//     };

//     const fundAccountResponse = await axios.post(
//       "https://api.razorpay.com/v1/fund_accounts",
//       fundAccountOptions,
//       {
//         auth: {
//           username: process.env.RAZORPAY_KEY_ID,
//           password: process.env.RAZORPAY_KEY_SECRET,
//         },
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const fundAccountId = fundAccountResponse.data.id;

//     // Step 3: Create a Payout
//     const payoutOptions = {
//       account_number: process.env.PLATFORMS_ACCOUNT_NUMBER, // Your platform's account number
//       fund_account_id: fundAccountId,
//       amount: payout * 100, // Amount in paise
//       currency: "INR",
//       mode: "IMPS",
//       purpose: "winning prize",
//       queue_if_low_balance: true,
//       reference_id: "Acme Transaction ID 12345",
//       narration: "Acme Corp Fund Transfer",
//       notes: {
//         notes_key_1: "Tea, Earl Grey, Hot",
//         notes_key_2: "Tea, Earl Grey… decaf.",
//       },
//     };

//     // Generate an idempotency key
//     const idempotencyKey = crypto.randomUUID(); // You can use any unique string

//     const payoutResponse = await axios.post(
//       "https://api.razorpay.com/v1/payouts",
//       payoutOptions,
//       {
//         auth: {
//           username: process.env.RAZORPAY_KEY_ID,
//           password: process.env.RAZORPAY_KEY_SECRET,
//         },
//         headers: {
//           "Content-Type": "application/json",
//           "X-Payout-Idempotency": idempotencyKey,
//         },
//       }
//     );
//     console.log("Payout Response: ", payoutResponse.data);
//     res.json(payoutResponse.data);
//   } catch (error) {
//     if (error.response) {
//       console.error("Payout Error:", error.response.data);
//       res.status(error.response.status).json(error.response.data);
//     } else if (error.request) {
//       console.error("No Response:", error.request);
//       res.status(500).json({ error: "No response from Razorpay" });
//     } else {
//       console.error("Error:", error.message);
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// const getAllFunds = async () => {
//   try {
//     const funds = await instance.fundAccount.create;
//     console.log("Funds:", funds);
//   } catch (error) {
//     console.error("Error getting funds:", error);
//   }
// };
// getAllFunds();
// export const createPayout = async () => {
//   try {
//     const payout = await instance.payouts.create({
//       account_number: "ACCOUNT_NUMBER",
//       fund_account_id: "FUND_ACCOUNT_ID",
//       amount: 1000000, // Amount in paise (e.g., 1000000 paise = ₹10,000)
//       currency: "INR",
//       mode: "NEFT",
//       purpose: "payout",
//       notes: {
//         note_key: "Beam me up Scotty",
//       },
//     });

//     console.log("Payout created:", payout);
//   } catch (error) {
//     console.error("Error creating payout:", error);
//   }
// };

export const getFunds = (customerId) => {
  return instance.fundAccount.fetch(customerId);
};
export const createNewCustomer = () => {
  instance.customers.create(
    {
      name: "Gaurav Singh",
      contact: 9000090010,
      email: "gaurav.kumar@example.com",
      fail_existing: 0,
      notes: {
        notes_key_1: "Tea, Earl Grey, Hot",
        notes_key_2: "Tea, Earl Grey… decaf.",
      },
    },
    function (err, customer) {
      if (err) {
        console.error("Error creating customer:", err);
      } else {
        console.log("Customer ID:", customer.id);
        return customer;
      }
    }
  );
};
export const createFunds = async (req, res) => {
  try {
    const fund = await instance.fundAccount.create({
      customer_id: "cust_P85gARyGG3GJRK",
      account_type: "bank_account",
      bank_account: {
        name: "Gaurav Singh",
        account_number: "11214311215411",
        ifsc: "HDFC0000053",
      },
    });
    console.log("Funds created successfully", fund);
    res.json({ message: "Funds created successfully" });
  } catch (error) {
    console.error("Error creating funds:", error);
  }
};

export const testing = async (req, res) => {
  // creating a fund account
  // getting all fund accounts
  // createNewCustomer();
  // createFunds();
  const fund = await getFunds("cust_P85gARyGG3GJRK");
  console.log("Funds:", fund);
};

export const createPayout = async (req, res) => {
  // const { account_number, ifsc, account_holder_name } = bankAccountDetails;
  const { amount, bankAccountDetails } = req.body;
  if (!instance.payouts) {
    throw new Error("Payouts feature is not available.");
  }
  const options = {
    amount: amount * 100,
    currency: "INR",
    bank_account: bankAccountDetails,
    purpose: "Withdrawal from wallet",
  };

  try {
    const response = await instance.payouts.create(options);
    console.log("Payout successful:", response);
    return response;
  } catch (error) {
    console.error("Error creating payout:", error);
    throw error;
  }
};

testing();

// Ensure your integration complies with PCI-DSS standards for handling payment information securely.
