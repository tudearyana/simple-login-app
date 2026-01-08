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
      
      // DEBUG: Log full response
      console.log('=== FULL RESPONSE ===')
      console.log('response:', response)
      console.log('response.data:', response.data)
      console.log('response.data.responseData:', response.data.responseData)
      console.log('response.data.responseCode:', response.data.responseCode)
      console.log('response.data.responseMessage:', response.data.responseMessage)
      
      // Jika HTTP status 200 atau 201, anggap sukses
      if (response.status === 200 || response.status === 201) {
        // ✅ CORRECT extraction - ambil dari responseData, dengan fallback
        const data = response.data.responseData || response.data
        
        console.log('=== EXTRACTED DATA ===')
        console.log('Extracted from:', response.data.responseData ? 'responseData' : 'response.data directly')
        console.log('data:', data)
        console.log('data.jwtToken:', data?.jwtToken)
        console.log('data.sessionId:', data?.sessionId)
        console.log('data.id:', data?.id)
        console.log('data.username:', data?.username)
        console.log('data.email:', data?.email)
        
        // Validasi: pastikan data ada
        if (!data) {
          console.error('❌ No data in response!')
          throw new Error('No data in response')
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
      console.error('Error response data:', error.response?.data)
      
      // Jika error tapi status 2xx, anggap sukses (workaround)
      if (error.response && (error.response.status === 200 || error.response.status === 201)) {
        const data = error.response.data.responseData || error.response.data
        console.log('Login responseData extracted (from error):', data)
        
        if (data.jwtToken) {
          localStorage.setItem('token', data.jwtToken)
        }
        
        if (data.sessionId) {
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
   * POST /api/users/validate/totp
   * @param {Object} totpData - { userId, otpCode }
   * @returns {Promise}
   */
  async validateTotp(totpData) {
    try {
      const response = await apiClient.post('/api/users/validate/totp', totpData)
      if (response.data.responseCode === '200' || response.data.responseCode === '201') {
        return response.data.responseData || response.data
      }
      throw new Error(response.data.responseMessage || 'TOTP validation failed')
    } catch (error) {
      throw error.response?.data || error
    }
  },

  /**
   * Validate backup code
   * POST /api/users/validate/backup
   * @param {Object} backupData - { userId, otpCode }
   * @returns {Promise}
   */
  async validateBackup(backupData) {
    try {
      const response = await apiClient.post('/api/users/validate/backup', backupData)
      if (response.data.responseCode === '200' || response.data.responseCode === '201') {
        return response.data.responseData || response.data
      }
      throw new Error(response.data.responseMessage || 'Backup code validation failed')
    } catch (error) {
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
