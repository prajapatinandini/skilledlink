const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment,getCredits } = require('../controllers/paymentController');

// Sirf 'protect' middleware use karenge, taaki koi bhi logged-in user (Student ya Company) payment kar sake
const { protect } = require("../middleware/authMiddleware");

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/credits', protect, getCredits);

module.exports = router;