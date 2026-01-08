<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const totpCode = ref('')
const backupCode = ref('')
const error = ref('')
const useBackup = ref(false)

const handleValidateTotp = async () => {
  error.value = ''
  
  if (!authStore.user?.id) {
    error.value = 'User ID not found. Please login again.'
    return
  }
  
  try {
    const response = await authStore.validateTotp(authStore.user.id, totpCode.value)
    
    if (response.token || response.success) {
      router.push('/')
    }
  } catch (err) {
    error.value = err.message || 'Invalid TOTP code'
  }
}

const handleValidateBackup = async () => {
  error.value = ''
  
  if (!authStore.user?.id) {
    error.value = 'User ID not found. Please login again.'
    return
  }
  
  try {
    const response = await authStore.validateBackup(authStore.user.id, backupCode.value)
    
    if (response.token || response.success) {
      router.push('/')
    }
  } catch (err) {
    error.value = err.message || 'Invalid backup code'
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
      <h2 class="mb-6 text-2xl font-bold text-center text-gray-800">Two-Factor Authentication</h2>
      
      <!-- TOTP Form -->
      <form v-if="!useBackup" @submit.prevent="handleValidateTotp" class="space-y-4">
        <p class="text-sm text-gray-600 text-center mb-4">
          Enter the 6-digit code from your authenticator app
        </p>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">TOTP Code</label>
          <input 
            v-model="totpCode" 
            type="text" 
            required
            maxlength="6"
            placeholder="000000"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center text-2xl tracking-widest"
          />
        </div>

        <div v-if="error" class="text-sm text-red-600 text-center">
          {{ error }}
        </div>

        <button 
          type="submit"
          :disabled="authStore.loading || totpCode.length !== 6"
          class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {{ authStore.loading ? 'Verifying...' : 'Verify' }}
        </button>

        <div class="text-center mt-4">
          <button
            type="button"
            @click="useBackup = true"
            class="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Use backup code instead
          </button>
        </div>
      </form>

      <!-- Backup Code Form -->
      <form v-else @submit.prevent="handleValidateBackup" class="space-y-4">
        <p class="text-sm text-gray-600 text-center mb-4">
          Enter one of your backup codes
        </p>
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Backup Code</label>
          <input 
            v-model="backupCode" 
            type="text" 
            required
            placeholder="Enter backup code"
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
          {{ authStore.loading ? 'Verifying...' : 'Verify' }}
        </button>

        <div class="text-center mt-4">
          <button
            type="button"
            @click="useBackup = false; backupCode = ''; error = ''"
            class="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Use authenticator app instead
          </button>
        </div>
      </form>

      <p class="mt-4 text-center text-sm text-gray-600">
        <RouterLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Back to Login
        </RouterLink>
      </p>
    </div>
  </div>
</template>
