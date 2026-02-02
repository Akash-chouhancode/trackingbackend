const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/contactMessage/contactMessage');
const authMiddleware = require('../../middleware/authMiddleware');
// Route to create a new contact message
router.post('/contact', contactController.createContactMessage);

// Route to get all contact messages
router.get('/contact', authMiddleware, contactController.getContactMessages);

module.exports = router;
