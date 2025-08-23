const { supabase } = require('./supabase');

/**
 * Get user's current credit balance
 * @param {string} userId - User ID from Supabase auth
 * @returns {Promise<{success: boolean, credit?: number, error?: string}>}
 */
async function getUserCredit(userId) {
  try {
    console.log(`[CREDIT SERVICE] Getting credit for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('user_credit')
      .select('credit')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If user not found, return 0 credit
      if (error.code === 'PGRST116') {
        console.log(`[CREDIT SERVICE] User ${userId} not found in credit table, returning 0`);
        return { success: true, credit: 0 };
      }
      
      console.error('[CREDIT SERVICE] Error fetching user credit:', error);
      return { success: false, error: error.message };
    }

    console.log(`[CREDIT SERVICE] User ${userId} has ${data.credit} credits`);
    return { success: true, credit: data.credit || 0 };
  } catch (error) {
    console.error('[CREDIT SERVICE] Exception in getUserCredit:', error);
    return { success: false, error: 'Failed to get user credit' };
  }
}

/**
 * Add credits to user's account
 * @param {string} userId - User ID from Supabase auth
 * @param {number} amount - Amount of credits to add (must be positive)
 * @returns {Promise<{success: boolean, newCredit?: number, error?: string}>}
 */
async function addUserCredit(userId, amount) {
  try {
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return { success: false, error: 'Invalid user ID or amount' };
    }

    console.log(`[CREDIT SERVICE] Adding ${amount} credits to user: ${userId}`);

    // Use upsert to handle both new users and existing users
    const { data, error } = await supabase
      .from('user_credit')
      .upsert(
        { 
          user_id: userId, 
          credit: amount,
          created_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
      .select('credit')
      .single();

    if (error) {
      // If upsert failed, try manual approach
      console.log('[CREDIT SERVICE] Upsert failed, trying manual approach');
      
      // First try to get existing credit
      const existing = await getUserCredit(userId);
      if (!existing.success) {
        return existing;
      }
      
      const newAmount = (existing.credit || 0) + amount;
      
      // Update or insert based on whether user exists
      let result;
      if (existing.credit !== undefined && existing.credit !== 0) {
        // Update existing record
        result = await supabase
          .from('user_credit')
          .update({ credit: newAmount })
          .eq('user_id', userId)
          .select('credit')
          .single();
      } else {
        // Insert new record
        result = await supabase
          .from('user_credit')
          .insert({ 
            user_id: userId, 
            credit: newAmount,
            created_at: new Date().toISOString()
          })
          .select('credit')
          .single();
      }
      
      if (result.error) {
        console.error('[CREDIT SERVICE] Error in manual credit addition:', result.error);
        return { success: false, error: result.error.message };
      }
      
      console.log(`[CREDIT SERVICE] Successfully added ${amount} credits to user ${userId}, new balance: ${result.data.credit}`);
      return { success: true, newCredit: result.data.credit };
    }

    console.log(`[CREDIT SERVICE] Successfully added ${amount} credits to user ${userId}, new balance: ${data.credit}`);
    return { success: true, newCredit: data.credit };
  } catch (error) {
    console.error('[CREDIT SERVICE] Exception in addUserCredit:', error);
    return { success: false, error: 'Failed to add user credit' };
  }
}

/**
 * Subtract credits from user's account
 * @param {string} userId - User ID from Supabase auth
 * @param {number} amount - Amount of credits to subtract (must be positive)
 * @returns {Promise<{success: boolean, newCredit?: number, error?: string}>}
 */
async function subtractUserCredit(userId, amount) {
  try {
    if (!userId || typeof amount !== 'number' || amount <= 0) {
      return { success: false, error: 'Invalid user ID or amount' };
    }

    console.log(`[CREDIT SERVICE] Subtracting ${amount} credits from user: ${userId}`);

    // First get current credit to check if sufficient
    const current = await getUserCredit(userId);
    if (!current.success) {
      return current;
    }

    const currentCredit = current.credit || 0;
    if (currentCredit < amount) {
      console.log(`[CREDIT SERVICE] Insufficient credits for user ${userId}: has ${currentCredit}, needs ${amount}`);
      return { success: false, error: 'Insufficient credits' };
    }

    const newAmount = currentCredit - amount;

    // Update the credit
    const { data, error } = await supabase
      .from('user_credit')
      .update({ credit: newAmount })
      .eq('user_id', userId)
      .select('credit')
      .single();

    if (error) {
      console.error('[CREDIT SERVICE] Error subtracting user credit:', error);
      return { success: false, error: error.message };
    }

    console.log(`[CREDIT SERVICE] Successfully subtracted ${amount} credits from user ${userId}, new balance: ${data.credit}`);
    return { success: true, newCredit: data.credit };
  } catch (error) {
    console.error('[CREDIT SERVICE] Exception in subtractUserCredit:', error);
    return { success: false, error: 'Failed to subtract user credit' };
  }
}

/**
 * Set user's credit to a specific amount
 * @param {string} userId - User ID from Supabase auth
 * @param {number} amount - Amount of credits to set (must be non-negative)
 * @returns {Promise<{success: boolean, newCredit?: number, error?: string}>}
 */
async function setUserCredit(userId, amount) {
  try {
    if (!userId || typeof amount !== 'number' || amount < 0) {
      return { success: false, error: 'Invalid user ID or amount' };
    }

    console.log(`[CREDIT SERVICE] Setting user ${userId} credit to: ${amount}`);

    // Use upsert to handle both new and existing users
    const { data, error } = await supabase
      .from('user_credit')
      .upsert(
        { 
          user_id: userId, 
          credit: amount,
          created_at: new Date().toISOString()
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
      .select('credit')
      .single();

    if (error) {
      console.error('[CREDIT SERVICE] Error setting user credit:', error);
      return { success: false, error: error.message };
    }

    console.log(`[CREDIT SERVICE] Successfully set user ${userId} credit to: ${data.credit}`);
    return { success: true, newCredit: data.credit };
  } catch (error) {
    console.error('[CREDIT SERVICE] Exception in setUserCredit:', error);
    return { success: false, error: 'Failed to set user credit' };
  }
}

/**
 * Get all users with their credit balances (admin function)
 * @param {number} limit - Maximum number of results to return
 * @param {number} offset - Number of results to skip
 * @returns {Promise<{success: boolean, users?: Array, total?: number, error?: string}>}
 */
async function getAllUserCredits(limit = 50, offset = 0) {
  try {
    console.log(`[CREDIT SERVICE] Getting all user credits (limit: ${limit}, offset: ${offset})`);
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('user_credit')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[CREDIT SERVICE] Error getting user credits count:', countError);
      return { success: false, error: countError.message };
    }

    // Get paginated results
    const { data, error } = await supabase
      .from('user_credit')
      .select('user_id, credit, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[CREDIT SERVICE] Error getting all user credits:', error);
      return { success: false, error: error.message };
    }

    console.log(`[CREDIT SERVICE] Retrieved ${data.length} user credit records`);
    return { success: true, users: data, total: count };
  } catch (error) {
    console.error('[CREDIT SERVICE] Exception in getAllUserCredits:', error);
    return { success: false, error: 'Failed to get user credits' };
  }
}

/**
 * Check if user has sufficient credits
 * @param {string} userId - User ID from Supabase auth
 * @param {number} requiredAmount - Required amount of credits
 * @returns {Promise<{success: boolean, hasEnough?: boolean, currentCredit?: number, error?: string}>}
 */
async function hasEnoughCredit(userId, requiredAmount) {
  try {
    if (!userId || typeof requiredAmount !== 'number' || requiredAmount < 0) {
      return { success: false, error: 'Invalid user ID or required amount' };
    }

    const result = await getUserCredit(userId);
    if (!result.success) {
      return result;
    }

    const currentCredit = result.credit || 0;
    const hasEnough = currentCredit >= requiredAmount;

    console.log(`[CREDIT SERVICE] User ${userId} has ${currentCredit} credits, needs ${requiredAmount}: ${hasEnough ? 'sufficient' : 'insufficient'}`);
    
    return { 
      success: true, 
      hasEnough, 
      currentCredit 
    };
  } catch (error) {
    console.error('[CREDIT SERVICE] Exception in hasEnoughCredit:', error);
    return { success: false, error: 'Failed to check credit balance' };
  }
}

module.exports = {
  getUserCredit,
  addUserCredit,
  subtractUserCredit,
  setUserCredit,
  getAllUserCredits,
  hasEnoughCredit
};
