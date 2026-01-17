<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  
  try {
    console.log('Attempting login...')
    const result = await authStore.login(username.value, password.value)
    console.log('Login result:', result)
    
    if (result.success) {
      // Check jika perlu 2FA validation
      if (result.requiresTwoFactor) {
        console.log('2FA required, redirecting to /validate/totp')
        router.push('/validate/totp')
      } else {
        console.log('Login successful, redirecting to home')
        router.push('/')
      }
    } else {
      error.value = authStore.error || 'Invalid credentials'
    }
  } catch (err) {
    console.error('Login failed:', err)
    error.value = err.message || 'Login failed'
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h2 class="mb-6 text-2xl font-bold text-center text-gray-800">Login</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Username</label>
          <input 
            v-model="username" 
            type="text" 
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input 
            v-model="password" 
            type="password" 
            required
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div v-if="error" class="text-sm text-red-600 text-center">
          {{ error }}
        </div>

        <button 
          type="submit"
          class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Sign In
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        Don't have an account? 
        <RouterLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
          Register here
        </RouterLink>
      </p>
    </div>
  </div>
</template>
