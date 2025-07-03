const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get all messages for a club
router.get('/:clubId', async (req, res) => {
  try {
    const messages = await Message.find({ club: req.params.clubId })
      .populate('sender', 'name photo _id')
      .sort({ timestamp: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router; 