import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)
  const sessionId = ref(localStorage.getItem('sessionId') || null)
  // Perbaikan: Cukup cek user saja jika backend tidak return token (session based)
  const isAuthenticated = computed(() => !!user.value)
  const loading = ref(false)
  const error = ref(null)
  const requiresTwoFactor = ref(false) // Flag untuk cek apakah perlu 2FA setelah login
  const activationData = ref(null) // Store QR code dan backup codes setelah aktivasi

  // Actions
  async function login(username, password) {
    loading.value = true
    error.value = null
    requiresTwoFactor.value = false
    
    try {
      console.log('Auth store: calling authService.login')
      const response = await authService.login({ username, password })
      
      console.log('=== AUTH STORE RECEIVED ===')
      console.log('response:', response)
      console.log('response.jwtToken:', response?.jwtToken)
      console.log('response.sessionId:', response?.sessionId)
      console.log('response.id:', response?.id)
      console.log('response.username:', response?.username)
      console.log('response.email:', response?.email)
      
      // Validasi response
      if (!response) {
        throw new Error('No response from login service')
      }
      
      // ✅ Simpan sessionId sebagai INTEGER (sudah disave di authService, tapi juga save ke state)
      if (response.sessionId) {
        const sessionIdInt = parseInt(response.sessionId, 10)
        sessionId.value = sessionIdInt
        console.log('✅ Auth store: sessionId saved as', sessionIdInt, 'type:', typeof sessionIdInt)
      } else {
        console.warn('⚠️ Auth store: No sessionId in response!', response)
      }
      
      // ✅ Simpan user data dari response
      user.value = { 
        id: response.id,
        username: response.username || username, 
        email: response.email,
        name: response.name || response.username || username 
      }
      console.log('✅ Auth store: user data saved', user.value)
      
      // Check jika perlu 2FA validation
      if (response.requiresTwoFactor || response.requires2FA) {
        requiresTwoFactor.value = true
        localStorage.setItem('user', JSON.stringify(user.value))
        loading.value = false
        console.log('⚠️ Auth store: 2FA required')
        return { success: true, requiresTwoFactor: true }
      }
      
      // ✅ Token sudah disave di authService, tapi juga save ke state
      if (response.jwtToken) {
        token.value = response.jwtToken
        console.log('✅ Auth store: token saved to state')
      } else {
        console.warn('⚠️ Auth store: No jwtToken found in response!', response)
      }
      
      localStorage.setItem('user', JSON.stringify(user.value))
      loading.value = false
      console.log('✅ Auth store: login successful!')
      return { success: true, requiresTwoFactor: false }
    } catch (err) {
      console.error('Auth store: login error', err)
      error.value = err.message || 'Login failed'
      loading.value = false
      return { success: false }
    }
  }

  async function register(username, email, password) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.register({ username, email, password })
      
      // Setelah register sukses
      if (response.user) {
        user.value = response.user
        localStorage.setItem('user', JSON.stringify(user.value))
      }
      
      if (response.token) {
        token.value = response.token
        localStorage.setItem('token', response.token)
      }
      
      loading.value = false
      return response
    } catch (err) {
      console.error('Registration error:', err)
      console.error('Error response:', err.response?.data)
      error.value = err.response?.data?.responseMessage || err.message || 'Registration failed'
      loading.value = false
      throw err
    }
  }

  async function activate(userId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.activate({ userId })
      // Response berisi { qrCodeUri, backupCodes }
      activationData.value = response
      loading.value = false
      return response
    } catch (err) {
      error.value = err.message || 'Activation failed'
      loading.value = false
      throw err
    }
  }

  async function validateTotp(userId, otpCode) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.validateTotp({ userId, otpCode })
      
      // Jika TOTP valid, update token dan clear 2FA flag
      if (response.token) {
        token.value = response.token
        localStorage.setItem('token', response.token)
        requiresTwoFactor.value = false
      }
      
      loading.value = false
      return response
    } catch (err) {
      error.value = err.message || 'TOTP validation failed'
      loading.value = false
      throw err
    }
  }

  async function validateBackup(userId, otpCode) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.validateBackup({ userId, otpCode })
      
      // Jika backup code valid, update token dan clear 2FA flag
      if (response.token) {
        token.value = response.token
        localStorage.setItem('token', response.token)
        requiresTwoFactor.value = false
      }
      
      loading.value = false
      return response
    } catch (err) {
      error.value = err.message || 'Backup code validation failed'
      loading.value = false
      throw err
    }
  }

  async function logout() {
    loading.value = true
    
    try {
      // ✅ Kirim sessionId ke backend untuk logout
      // Pastikan sessionId adalah INTEGER dari localStorage
      const storedSessionId = localStorage.getItem('sessionId')
      const logoutSessionId = storedSessionId ? parseInt(storedSessionId, 10) : (sessionId.value || user.value?.id)
      
      console.log('=== AUTH STORE LOGOUT ===')
      console.log('storedSessionId from localStorage:', storedSessionId)
      console.log('logoutSessionId (parsed):', logoutSessionId, 'type:', typeof logoutSessionId)
      
      if (!logoutSessionId) {
        console.error('No sessionId available for logout!')
      }
      
      await authService.logout({ sessionId: logoutSessionId })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Bersihkan state meskipun API error
      user.value = null
      token.value = null
      sessionId.value = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('sessionId')
      loading.value = false
    }
  }

  return { 
    user, 
    token, 
    sessionId,
    isAuthenticated, 
    loading, 
    error,
    requiresTwoFactor,
    activationData,
    login, 
    register, 
    activate,
    validateTotp,
    validateBackup,
    logout 
  }
})
