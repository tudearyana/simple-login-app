<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const activationCode = ref('')
const activationToken = ref('')
const error = ref('')
const success = ref(false)

// Ambil email dari localStorage jika ada (dari proses register)
const pendingEmail = localStorage.getItem('pendingEmail') || ''

const handleActivate = async () => {
  error.value = ''
  
  try {
    const response = await authStore.activate({
      code: activationCode.value,
      token: activationToken.value,
      email: pendingEmail
    })
    
    success.value = true
    
    // Redirect ke login setelah beberapa detik
    setTimeout(() => {
      localStorage.removeItem('pendingEmail')
      router.push('/login')
    }, 2000)
  } catch (err) {
    error.value = err.message || 'Activation failed'
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h2 class="mb-6 text-2xl font-bold text-center text-gray-800">Activate Account</h2>
      
      <div v-if="success" class="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-center">
        Account activated successfully! Redirecting to login...
      </div>
      
      <form v-else @submit.prevent="handleActivate" class="space-y-4">
        <div v-if="pendingEmail" class="text-sm text-gray-600 text-center mb-4">
          Activating account for: <strong>{{ pendingEmail }}</strong>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Activation Code</label>
          <input 
            v-model="activationCode" 
            type="text" 
            required
            placeholder="Enter code from email"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Activation Token (Optional)</label>
          <input 
            v-model="activationToken" 
            type="text" 
            placeholder="If provided in email"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div v-if="error" class="text-sm text-red-600 text-center">
          {{ error }}
        </div>

        <button 
          type="submit"
          :disabled="authStore.loading"
          class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {{ authStore.loading ? 'Activating...' : 'Activate' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        <RouterLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Back to Login
        </RouterLink>
      </p>
    </div>
  </div>
</template>
