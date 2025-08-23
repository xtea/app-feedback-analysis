const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  getUserCredit,
  addUserCredit,
  subtractUserCredit,
  setUserCredit,
  getAllUserCredits,
  hasEnoughCredit
} = require('../services/creditService');

// Get current user's credit balance
router.get('/balance', requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub; // Supabase JWT contains user ID in 'sub' field
    
    const result = await getUserCredit(userId);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      credit: result.credit,
      userId: userId
    });
  } catch (error) {
    console.error('[CREDIT ROUTES] Error getting credit balance:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});


module.exports = router;
