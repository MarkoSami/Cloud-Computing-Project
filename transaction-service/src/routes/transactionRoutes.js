const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// User service URL
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:8000';

// Helper function to get user by email
const getUserByEmail = async (email) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/by-email/${email}`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
};

// Create a new transaction
router.post(
  '/',
  [
    body('sender_email').isEmail().withMessage('Valid sender email is required'),
    body('receiver_email').isEmail().withMessage('Valid receiver email is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { sender_email, receiver_email, amount } = req.body;
      
      if (sender_email === receiver_email) {
        return res.status(400).json({ message: 'Cannot transfer to same account' });
      }

      // Get sender and receiver details
      const sender = await getUserByEmail(sender_email);
      const receiver = await getUserByEmail(receiver_email);

      if (!sender || !receiver) {
        return res.status(404).json({ message: 'Sender or receiver not found' });
      }

      // Check if sender has enough balance
      if (sender.balance < amount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }

      // Update sender balance
      await axios.put(`${USER_SERVICE_URL}/api/users/${sender.id}/balance`, {
        amount: -amount
      });

      // Update receiver balance
      await axios.put(`${USER_SERVICE_URL}/api/users/${receiver.id}/balance`, {
        amount: amount
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          senderId: sender.id,
          senderEmail: sender_email,
          receiverId: receiver.id,
          receiverEmail: receiver_email,
          amount,
        },
      });

      res.status(201).json({
        message: 'Transaction completed successfully',
        transaction
      });
    } catch (error) {
      console.error('Transaction error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get user's transactions
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 