import express from 'express';
import Feedback from '../models/Feedback.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/feedback - Admin get all feedback
router.get('/', protect, admin, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching feedback' });
  }
});

// POST /api/feedback - User submit feedback
router.post('/', protect, async (req, res) => {
  try {
    const { rating, message } = req.body;
    
    if (!rating || !message) {
      return res.status(400).json({ message: 'Rating and message are required' });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      rating,
      message
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting feedback' });
  }
});

export default router;
