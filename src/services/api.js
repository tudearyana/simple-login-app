import axios from 'axios'

// Base URL untuk backend Spring Boot
// Gunakan environment variable jika tersedia, fallback ke empty string untuk proxy
// Jika VITE_API_BASE_URL kosong, akan menggunakan relative URL lewat Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Buat instance axios dengan konfigurasi default
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials jika backend menggunakan session/cookies
  withCredentials: false,
})

// Request interceptor - untuk menambahkan token jika ada
apiClient.interceptors.request.use(
  (config) => {
    // Ambil token dari localStorage jika ada
    const token = localStorage.getItem('token')
    console.log('[API Interceptor] Request to:', config.url)
    console.log('[API Interceptor] Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NO TOKEN')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('[API Interceptor] Added Authorization header')
    } else {
      console.warn('[API Interceptor] ⚠️ No token found in localStorage!')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - untuk handle error global
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle error global
    if (error.response) {
      // Server merespons dengan status error
      console.error('API Error:', error.response.data)
      
      // Jika unauthorized (401), redirect ke login
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      console.error('Network Error:', error.request)
    } else {
      // Error lainnya
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
