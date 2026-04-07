const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/User"); 

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body; 
    const options = {
      amount: amount * 100, // Razorpay works in paise (₹1 = 100 paise)
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    if (!order) return res.status(500).send("Failed to create order");

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, creditsToAdd } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const userId = req.user._id || req.user.id;
      
      const user = await User.findByIdAndUpdate(
        userId,
        { $inc: { credits: creditsToAdd } }, 
        { new: true }
      );

      return res.status(200).json({ message: "Payment verified", credits: user.credits });
    } else {
      return res.status(400).json({ message: "Invalid payment signature!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3️⃣ Get Current Credits API
exports.getCredits = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.status(200).json({ credits: user.credits || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error fetching credits" });
  }
};