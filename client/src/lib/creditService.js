import axios from 'axios';

/**
 * Frontend service for credit management API calls
 */

const API_BASE = process.env.NODE_ENV === 'production' ? '' : '';

/**
 * Get current user's credit balance
 * @returns {Promise<{success: boolean, credit?: number, error?: string}>}
 */
export const getUserCredit = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/credit/balance`);
    return {
      success: true,
      credit: response.data.credit
    };
  } catch (error) {
    console.error('[CREDIT SERVICE] Error fetching user credit:', error);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Authentication required'
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to fetch credit balance'
    };
  }
};

/**
 * Add credits to current user's account
 * @param {number} amount - Amount of credits to add
 * @returns {Promise<{success: boolean, newCredit?: number, error?: string}>}
 */
export const addUserCredit = async (amount) => {
  try {
    const response = await axios.post(`${API_BASE}/api/credit/add`, { amount });
    return {
      success: true,
      newCredit: response.data.newCredit
    };
  } catch (error) {
    console.error('[CREDIT SERVICE] Error adding user credit:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to add credits'
    };
  }
};

/**
 * Check if user has enough credits for a specific operation
 * @param {number} requiredAmount - Required amount of credits
 * @returns {Promise<{success: boolean, hasEnough?: boolean, currentCredit?: number, error?: string}>}
 */
export const checkUserCredit = async (requiredAmount) => {
  try {
    const response = await axios.post(`${API_BASE}/api/credit/check`, { requiredAmount });
    return {
      success: true,
      hasEnough: response.data.hasEnough,
      currentCredit: response.data.currentCredit
    };
  } catch (error) {
    console.error('[CREDIT SERVICE] Error checking user credit:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to check credit balance'
    };
  }
};
