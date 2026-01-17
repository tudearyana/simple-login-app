import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userService } from '../services/userService'

/**
 * User Store - Manage user profile state and actions
 * Handles profile fetching and updates (username, email, password)
 */
export const useUserStore = defineStore('user', () => {
  // State
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const successMessage = ref(null)

  // Getters
  const hasProfile = computed(() => !!profile.value)
  const username = computed(() => profile.value?.username || '')
  const email = computed(() => profile.value?.email || '')
  const userStatus = computed(() => profile.value?.status || '')
  const twoFactorStatus = computed(() => profile.value?.twoFactorStatus || 'INACTIVE')
  const userId = computed(() => profile.value?.id || null)

  // Actions

  /**
   * Fetch current user profile
   * @returns {Promise<Object>} User profile data
   */
  async function fetchProfile() {
    loading.value = true
    error.value = null
    successMessage.value = null

    try {
      console.log('[UserStore] Fetching user profile...')
      const data = await userService.getCurrentUser()
      
      profile.value = data
      console.log('[UserStore] ✅ Profile loaded:', profile.value)
      
      return data
    } catch (err) {
      console.error('[UserStore] ❌ Failed to fetch profile:', err)
      error.value = err.message || 'Failed to load profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update username
   * @param {string} newUsername - New username
   * @returns {Promise<Object>} Updated user data
   */
  async function updateUsername(newUsername) {
    loading.value = true
    error.value = null
    successMessage.value = null

    try {
      console.log('[UserStore] Updating username to:', newUsername)
      const data = await userService.updateUsername(newUsername)
      
      // Update local profile state
      profile.value = data
      successMessage.value = 'Username updated successfully'
      console.log('[UserStore] ✅ Username updated:', profile.value)
      
      return data
    } catch (err) {
      console.error('[UserStore] ❌ Failed to update username:', err)
      error.value = err.message || 'Failed to update username'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update email
   * @param {string} newEmail - New email address
   * @returns {Promise<Object>} Updated user data
   */
  async function updateEmail(newEmail) {
    loading.value = true
    error.value = null
    successMessage.value = null

    try {
      console.log('[UserStore] Updating email to:', newEmail)
      const data = await userService.updateEmail(newEmail)
      
      // Update local profile state
      profile.value = data
      successMessage.value = 'Email updated successfully'
      console.log('[UserStore] ✅ Email updated:', profile.value)
      
      return data
    } catch (err) {
      console.error('[UserStore] ❌ Failed to update email:', err)
      error.value = err.message || 'Failed to update email'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Success response
   */
  async function updatePassword(currentPassword, newPassword) {
    loading.value = true
    error.value = null
    successMessage.value = null

    try {
      console.log('[UserStore] Updating password...')
      await userService.updatePassword(currentPassword, newPassword)
      
      successMessage.value = 'Password changed successfully'
      console.log('[UserStore] ✅ Password updated')
      
      return { success: true }
    } catch (err) {
      console.error('[UserStore] ❌ Failed to update password:', err)
      error.value = err.message || 'Failed to update password'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear error and success messages
   */
  function clearMessages() {
    error.value = null
    successMessage.value = null
  }

  /**
   * Reset store state
   */
  function resetStore() {
    profile.value = null
    loading.value = false
    error.value = null
    successMessage.value = null
  }

  return {
    // State
    profile,
    loading,
    error,
    successMessage,
    
    // Getters
    hasProfile,
    username,
    email,
    userStatus,
    twoFactorStatus,
    userId,
    
    // Actions
    fetchProfile,
    updateUsername,
    updateEmail,
    updatePassword,
    clearMessages,
    resetStore
  }
})
