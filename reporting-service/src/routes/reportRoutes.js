const express = require('express');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Service URLs
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:8000';

// Get all transactions (with optional date filters)
router.get('/transactions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let whereClause = {};
    
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    } else if (startDate) {
      whereClause.createdAt = {
        gte: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.createdAt = {
        lte: new Date(endDate)
      };
    }
    
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate total amount
    const totalAmount = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Count transactions
    const transactionCount = transactions.length;

    res.json({
      transactions,
      summary: {
        totalAmount,
        transactionCount,
        averageAmount: transactionCount > 0 ? totalAmount / transactionCount : 0
      }
    });
  } catch (error) {
    console.error('Get transactions report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user-specific transaction reports
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user details
    let userDetails;
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`);
      userDetails = response.data.user;
    } catch (error) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get sent transactions
    const sentTransactions = await prisma.transaction.findMany({
      where: {
        senderId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get received transactions
    const receivedTransactions = await prisma.transaction.findMany({
      where: {
        receiverId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Calculate totals
    const totalSent = sentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalReceived = receivedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    res.json({
      user: userDetails,
      summary: {
        totalSent,
        totalReceived,
        netFlow: totalReceived - totalSent,
        sentTransactionCount: sentTransactions.length,
        receivedTransactionCount: receivedTransactions.length
      },
      sentTransactions,
      receivedTransactions
    });
  } catch (error) {
    console.error('Get user report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 