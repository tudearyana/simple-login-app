import apiClient from './api'

// Service untuk semua endpoint authentication
export const authService = {
  /**
   * Register user baru
   * POST /api/users/register
   * @param {Object} userData - { username, email, password }
   * @returns {Promise}
   */
  async register(userData) {
    try {
      console.log('Sending registration data:', userData)
      const response = await apiClient.post('/api/users/register', userData)
      console.log('Registration response FULL:', response)
      console.log('Registration response data:', response.data)
      console.log('Registration response status:', response.status)
      
      // Jika HTTP status 200 atau 201, anggap sukses
      if (response.status === 200 || response.status === 201) {
        // Return data sesuai format backend
        return response.data.responseData || response.data
      }
      
      // Jika sampai sini, ada masalah (unlikely karena axios akan throw error untuk non-2xx)
      throw new Error(response.data.responseMessage || 'Registration failed')
    } catch (error) {
      console.error('Registration API error:', error)
      console.error('Error response data:', error.response?.data)
      
      // Jika error tapi status 2xx, anggap sukses (workaround)
      if (error.response && (error.response.status === 200 || error.response.status === 201)) {
        return error.response.data.responseData || error.response.data
      }
      
      // Throw dengan format yang lebih jelas
      const errorMessage = error.response?.data?.responseMessage || error.response?.data?.message || error.message
      throw new Error(errorMessage)
    }
  },

  /**
   * Login user
   * POST /api/users/login
   * @param {Object} credentials - { username, password }
   * @returns {Promise}
   */
  async login(credentials) {
    try {
      console.log('Sending login data:', credentials)
      const response = await apiClient.post('/api/users/login', credentials)
      
      // DEBUG: Log EVERYTHING about response
      console.log('=== FULL RESPONSE STRUCTURE ===')
      console.log('response:', response)
      console.log('response.status:', response.status)
      console.log('response.headers:', response.headers)
      console.log('response.data:', response.data)
      console.log('response.data type:', typeof response.data)
      console.log('response.data keys:', response.data ? Object.keys(response.data) : 'null')
      
      // Try to extract data from multiple possible structures
      let data = null
      let extractMethod = 'UNKNOWN'
      
      // Method 1: responseData wrapper (Spring Boot standard)
      if (response.data?.responseData) {
        data = response.data.responseData
        extractMethod = 'responseData'
      }
      // Method 2: Direct data (no wrapper)
      else if (response.data?.jwtToken || response.data?.sessionId) {
        data = response.data
        extractMethod = 'direct'
      }
      // Method 3: data field
      else if (response.data?.data) {
        data = response.data.data
        extractMethod = 'data'
      }
      // Method 4: body field
      else if (response.data?.body) {
        data = response.data.body
        extractMethod = 'body'
      }
      // Method 5: Check if response.data itself has user properties
      else if (response.data?.username || response.data?.email) {
        data = response.data
        extractMethod = 'direct-user'
      }
      
      console.log('=== EXTRACTION ===')
      console.log('Extract method:', extractMethod)
      console.log('Extracted data:', data)
      console.log('data.jwtToken:', data?.jwtToken)
      console.log('data.sessionId:', data?.sessionId)
      console.log('data.id:', data?.id)
      console.log('data.username:', data?.username)
      
      // Jika HTTP status 200 atau 201, anggap sukses
      if (response.status === 200 || response.status === 201) {
        // Validasi: pastikan data ada
        if (!data) {
          console.error('❌ Could not extract data from response!')
          console.error('Response structure:', JSON.stringify(response.data, null, 2))
          throw new Error('Unable to parse response from server')
        }
        
        // Simpan jwtToken jika ada
        if (data.jwtToken) {
          console.log('✅ Saving jwtToken to localStorage')
          localStorage.setItem('token', data.jwtToken)
        } else {
          console.warn('⚠️ No jwtToken in response')
        }
        
        // ✅ PENTING: Simpan sessionId sebagai INTEGER
        if (data.sessionId) {
          const sessionIdInt = parseInt(data.sessionId, 10)
          console.log('✅ Saving sessionId to localStorage:', sessionIdInt, 'type:', typeof sessionIdInt)
          localStorage.setItem('sessionId', sessionIdInt.toString())
        } else {
          console.warn('⚠️ No sessionId in response')
        }
        
        return data
      }
      
      throw new Error(response.data.responseMessage || 'Login failed')
    } catch (error) {
      console.error('Login API error:', error)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      
      // Jika error tapi status 2xx, anggap sukses (workaround)
      if (error.response && (error.response.status === 200 || error.response.status === 201)) {
        const data = error.response.data.responseData || error.response.data
        console.log('Login responseData extracted (from error):', data)
        
        if (data?.jwtToken) {
          localStorage.setItem('token', data.jwtToken)
        }
        
        if (data?.sessionId) {
          const sessionIdInt = parseInt(data.sessionId, 10)
          localStorage.setItem('sessionId', sessionIdInt.toString())
        }
        
        return data
      }
      
      const errorMessage = error.response?.data?.responseMessage || error.response?.data?.message || error.message
      throw new Error(errorMessage)
    }
  },

  /**
   * Activate 2FA for user
   * POST /api/users/activate
   * @param {Object} activationData - { userId }
   * @returns {Promise} - Returns { qrCodeUri, backupCodes }
   */
  async activate(activationData) {
    try {
      const response = await apiClient.post('/api/users/activate', activationData)
      // Response format: { responseCode: "201", responseMessage: "Activation success", responseData: { qrCodeUri, backupCodes } }
      if (response.data.responseCode === '201' || response.data.responseCode === '200') {
        return response.data.responseData
      }
      throw new Error(response.data.responseMessage || 'Activation failed')
    } catch (error) {
      throw error.response?.data || error
    }
  },

  /**
   * Validate TOTP (Time-based One-Time Password)
   * POST /api/users/validate-totp
   * @param {Object} totpData - { userId, otpCode }
   * @returns {Promise}
   */
  async validateTotp(totpData) {
    try {
      console.log('Validating TOTP with data:', totpData)
      const response = await apiClient.post('/api/users/validate/totp', totpData)
      console.log('TOTP validation response:', response.data)
      if (response.data.responseCode === '200' || response.data.responseCode === '201') {
        return response.data.responseData || response.data
      }
      throw new Error(response.data.responseMessage || 'TOTP validation failed')
    } catch (error) {
      console.error('TOTP validation error:', error.response?.data || error)
      throw error.response?.data || error
    }
  },

  /**
   * Validate backup code
   * POST /api/users/validate-backup
   * @param {Object} backupData - { userId, otpCode }
   * @returns {Promise}
   */
  async validateBackup(backupData) {
    try {
      console.log('Validating backup code with data:', backupData)
      const response = await apiClient.post('/api/users/validate/backup', backupData)
      console.log('Backup validation response:', response.data)
      if (response.data.responseCode === '200' || response.data.responseCode === '201') {
        return response.data.responseData || response.data
      }
      throw new Error(response.data.responseMessage || 'Backup code validation failed')
    } catch (error) {
      console.error('Backup validation error:', error.response?.data || error)
      throw error.response?.data || error
    }
  },

  /**
   * Get current user profile
   * POST /api/users/me (with sessionId in body)
   * @returns {Promise} - User profile data
   */
  async getUserProfile() {
    try {
      // Get sessionId from localStorage
      const sessionId = localStorage.getItem('sessionId')
      
      if (!sessionId) {
        throw new Error('Session ID not found. Please login again.')
      }
      
      const sessionIdInt = parseInt(sessionId, 10)
      console.log('Fetching user profile from POST /api/users/me with sessionId:', sessionIdInt)
      
      // POST with sessionId in body
      const response = await apiClient.post('/api/users/me', { sessionId: sessionIdInt })
      console.log('User profile response:', response.data)
      
      if (response.data.responseCode === '200' || response.status === 200) {
        return response.data.responseData || response.data
      }
      throw new Error(response.data.responseMessage || 'Failed to fetch user profile')
    } catch (error) {
      console.error('Get user profile error:', error.response?.data || error)
      throw error.response?.data || error
    }
  },

  /**
   * Update user profile (username and/or email)
   * Calls separate endpoints for username and email updates
   * @param {Object} userData - { userId, username, email }
   * @returns {Promise}
   */
  async updateUser(userData) {
    try {
      const userId = parseInt(userData.userId, 10)
      console.log('=== UPDATE USER REQUEST ===')
      console.log('Original data:', userData)
      console.log('userId:', userId)
      
      let usernameUpdated = false
      let emailUpdated = false
      
      // Update username if provided and not null
      if (userData.username !== null && userData.username !== undefined && userData.username !== '') {
        try {
          console.log('Updating username to:', userData.username)
          const response = await apiClient.post('/api/users/updateUsername', {
            userId: userId,
            newUsername: userData.username
          })
          console.log('Update username response:', response.data)
          
          if (response.data.responseCode === '200' || response.status === 200) {
            usernameUpdated = true
          }
        } catch (error) {
          console.error('Update username error:', error.response?.data || error)
          const errorMsg = error.response?.data?.message || error.response?.data?.responseMessage || 'Failed to update username'
          throw new Error(errorMsg)
        }
      }
      
      // Update email if provided and not null
      if (userData.email !== null && userData.email !== undefined && userData.email !== '') {
        try {
          console.log('Updating email to:', userData.email)
          const response = await apiClient.post('/api/users/updateEmail', {
            userId: userId,
            newEmail: userData.email
          })
          console.log('Update email response:', response.data)
          
          if (response.data.responseCode === '200' || response.status === 200) {
            emailUpdated = true
          }
        } catch (error) {
          console.error('Update email error:', error.response?.data || error)
          const errorMsg = error.response?.data?.message || error.response?.data?.responseMessage || 'Failed to update email'
          throw new Error(errorMsg)
        }
      }
      
      console.log('✅ Update completed - Username:', usernameUpdated, 'Email:', emailUpdated)
      return { usernameUpdated, emailUpdated }
    } catch (error) {
      console.error('Update user error:', error)
      throw error
    }
  },

  /**
   * Change user password
   * POST /api/users/change-password
   * @param {Object} passwordData - { userId, currentPassword, newPassword }
   * @returns {Promise}
   */
  async changePassword(passwordData) {
    try {
      console.log('Changing password for userId:', passwordData.userId)
      const response = await apiClient.post('/api/users/change-password', passwordData)
      console.log('Change password response:', response.data)
      
      if (response.data.responseCode === '200' || response.data.responseCode === '201') {
        return response.data.responseData || response.data
      }
      throw new Error(response.data.responseMessage || 'Failed to change password')
    } catch (error) {
      console.error('Change password error:', error.response?.data || error)
      throw error.response?.data || error
    }
  },

  /**
   * Disable 2FA for user
   * POST /api/users/disable-2fa
   * @param {number} userId - User ID
   * @returns {Promise}
   */
  async disable2FA(userId) {
    try {
      console.log('Disabling 2FA for userId:', userId)
      const response = await apiClient.post('/api/users/disable-2fa', {
        userId: parseInt(userId, 10)
      })
      console.log('Disable 2FA response:', response.data)
      
      if (response.data.code === '200' || response.status === 200) {
        return response.data
      }
      throw new Error(response.data.message || 'Failed to disable 2FA')
    } catch (error) {
      console.error('Disable 2FA error:', error.response?.data || error)
      throw error.response?.data || error
    }
  },

  /**
   * Logout user (opsional, tergantung backend)
   * POST /logout
   * @param {Object} logoutData - { sessionId }
   * @returns {Promise}
   */
  async logout(logoutData = {}) {
    try {
      // ✅ PENTING: Pastikan sessionId adalah INTEGER, bukan string
      const sessionIdInt = logoutData.sessionId ? parseInt(logoutData.sessionId, 10) : null
      
      console.log('=== LOGOUT DEBUG ===')
      console.log('Original sessionId:', logoutData.sessionId, 'Type:', typeof logoutData.sessionId)
      console.log('Converted sessionId:', sessionIdInt, 'Type:', typeof sessionIdInt)
      console.log('Sending to backend:', { sessionId: sessionIdInt })
      
      if (!sessionIdInt || isNaN(sessionIdInt)) {
        console.error('❌ sessionId is invalid!', sessionIdInt)
        throw new Error('sessionId is required and must be a valid integer')
      }
      
      const response = await apiClient.post('/api/users/logout', { 
        sessionId: sessionIdInt  // Kirim sebagai integer
      })
      
      console.log('✅ Logout response:', response.data)
      
      // Hapus token dari localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('sessionId')
      return response.data
    } catch (error) {
      console.error('❌ Logout error:', error)
      console.error('Error details:', error.response?.data)
      
      // Tetap hapus token meskipun API error
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('sessionId')
      throw error.response?.data || error.message
    }
  }
}