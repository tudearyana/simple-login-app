import apiClient from './api'

/**
 * User Service - Handle user profile management endpoints
 * All endpoints require JWT authentication (handled by axios interceptor)
 */
export const userService = {
  /**
   * Get current user profile
   * POST /api/users/me
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      console.log('[UserService] Fetching current user profile')
      const response = await apiClient.post('/api/users/me', {})
      
      console.log('[UserService] Profile response:', response.data)
      
      // Handle response wrapper format
      if (response.data.responseCode === '200' || response.status === 200) {
        const userData = response.data.data || response.data.responseData || response.data
        console.log('[UserService] ✅ Profile fetched successfully:', userData)
        return userData
      }
      
      throw new Error(response.data.responseMessage || 'Failed to fetch user profile')
    } catch (error) {
      console.error('[UserService] ❌ Get profile error:', error)
      const errorMessage = error.response?.data?.responseMessage || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to fetch user profile'
      throw new Error(errorMessage)
    }
  },

  /**
   * Update username
   * POST /api/users/updateUsername
   * @param {string} newUsername - New username (3-50 chars, alphanumeric + underscore)
   * @returns {Promise<Object>} Updated user data
   */
  async updateUsername(newUsername) {
    try {
      console.log('[UserService] Updating username to:', newUsername)
      
      // Frontend validation
      if (!newUsername || newUsername.trim().length === 0) {
        throw new Error('Username cannot be empty')
      }
      
      if (newUsername.length < 3 || newUsername.length > 50) {
        throw new Error('Username must be between 3 and 50 characters')
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
        throw new Error('Username can only contain letters, numbers, and underscores')
      }
      
      const response = await apiClient.post('/api/users/updateUsername', {
        newUsername: newUsername.trim()
      })
      
      console.log('[UserService] Update username response:', response.data)
      
      if (response.data.responseCode === '200' || response.status === 200) {
        const userData = response.data.data || response.data.responseData || response.data
        console.log('[UserService] ✅ Username updated successfully:', userData)
        return userData
      }
      
      throw new Error(response.data.responseMessage || 'Failed to update username')
    } catch (error) {
      console.error('[UserService] ❌ Update username error:', error)
      const errorMessage = error.response?.data?.responseMessage || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update username'
      throw new Error(errorMessage)
    }
  },

  /**
   * Update email
   * POST /api/users/updateEmail
   * @param {string} newEmail - New email address (valid email format)
   * @returns {Promise<Object>} Updated user data
   */
  async updateEmail(newEmail) {
    try {
      console.log('[UserService] Updating email to:', newEmail)
      
      // Frontend validation
      if (!newEmail || newEmail.trim().length === 0) {
        throw new Error('Email cannot be empty')
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(newEmail)) {
        throw new Error('Please enter a valid email address')
      }
      
      const response = await apiClient.post('/api/users/updateEmail', {
        newEmail: newEmail.trim()
      })
      
      console.log('[UserService] Update email response:', response.data)
      
      if (response.data.responseCode === '200' || response.status === 200) {
        const userData = response.data.data || response.data.responseData || response.data
        console.log('[UserService] ✅ Email updated successfully:', userData)
        return userData
      }
      
      throw new Error(response.data.responseMessage || 'Failed to update email')
    } catch (error) {
      console.error('[UserService] ❌ Update email error:', error)
      const errorMessage = error.response?.data?.responseMessage || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update email'
      throw new Error(errorMessage)
    }
  },

  /**
   * Update password
   * POST /api/users/updatePassword
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password (min 8 chars)
   * @returns {Promise<Object>} Success response
   */
  async updatePassword(currentPassword, newPassword) {
    try {
      console.log('[UserService] Updating password')
      
      // Frontend validation
      if (!currentPassword || currentPassword.trim().length === 0) {
        throw new Error('Current password is required')
      }
      
      if (!newPassword || newPassword.trim().length === 0) {
        throw new Error('New password is required')
      }
      
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long')
      }
      
      if (currentPassword === newPassword) {
        throw new Error('New password must be different from current password')
      }
      
      const response = await apiClient.post('/api/users/updatePassword', {
        currentPassword,
        newPassword
      })
      
      console.log('[UserService] Update password response:', response.data)
      
      if (response.data.responseCode === '200' || response.status === 200) {
        console.log('[UserService] ✅ Password updated successfully')
        return response.data
      }
      
      throw new Error(response.data.responseMessage || 'Failed to update password')
    } catch (error) {
      console.error('[UserService] ❌ Update password error:', error)
      const errorMessage = error.response?.data?.responseMessage || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update password'
      throw new Error(errorMessage)
    }
  }
}
