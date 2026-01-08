<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import QRCodeVue from 'qrcode.vue'

const authStore = useAuthStore()
const showActivationModal = ref(false)
const activating = ref(false)
const error = ref('')

const handleActivate2FA = async () => {
  if (!authStore.user?.id) {
    error.value = 'User ID not found'
    return
  }

  activating.value = true
  error.value = ''

  try {
    await authStore.activate(authStore.user.id)
    showActivationModal.value = true
  } catch (err) {
    error.value = err.message || 'Activation failed'
  } finally {
    activating.value = false
  }
}

const closeModal = () => {
  showActivationModal.value = false
}

const downloadBackupCodes = () => {
  if (!authStore.activationData?.backupCodes) return

  const codes = authStore.activationData.backupCodes.join('\n')
  const blob = new Blob([codes], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'backup-codes.txt'
  a.click()
  URL.revokeObjectURL(url)
}

const copyBackupCodes = () => {
  if (!authStore.activationData?.backupCodes) return

  const codes = authStore.activationData.backupCodes.join('\n')
  navigator.clipboard.writeText(codes).then(() => {
    alert('Backup codes copied to clipboard!')
  })
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">User Management</h1>

      <!-- User Info Card -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">User Information</h2>
        
        <div class="space-y-3">
          <div class="flex items-center">
            <span class="font-medium text-gray-700 w-32">Username:</span>
            <span class="text-gray-900">{{ authStore.user?.username || authStore.user?.name }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium text-gray-700 w-32">Email:</span>
            <span class="text-gray-900">{{ authStore.user?.email || '-' }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium text-gray-700 w-32">User ID:</span>
            <span class="text-gray-900">{{ authStore.user?.id }}</span>
          </div>
        </div>
      </div>

      <!-- 2FA Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Two-Factor Authentication</h2>
        
        <p class="text-gray-600 mb-4">
          Enhance your account security by enabling two-factor authentication (2FA). 
          You'll need to scan a QR code with your authenticator app.
        </p>

        <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>

        <button
          @click="handleActivate2FA"
          :disabled="activating"
          class="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ activating ? 'Activating...' : 'Activate 2FA' }}
        </button>
      </div>

      <!-- Activation Modal -->
      <div
        v-if="showActivationModal && authStore.activationData"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-2xl font-bold text-gray-800">2FA Activation Success</h3>
              <button
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <!-- QR Code Section -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">1. Scan QR Code</h4>
              <p class="text-gray-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div class="flex justify-center bg-gray-50 p-6 rounded-lg">
                <QRCodeVue
                  :value="authStore.activationData.qrCodeUri"
                  :size="250"
                  level="H"
                />
              </div>
            </div>

            <!-- Backup Codes Section -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-800 mb-3">2. Save Your Backup Codes</h4>
              <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p class="text-yellow-800">
                  <strong>Important:</strong> Save these backup codes in a secure location. 
                  You can use them to access your account if you lose your authenticator device.
                </p>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg mb-4">
                <div class="grid grid-cols-2 gap-2 font-mono text-sm">
                  <div
                    v-for="(code, index) in authStore.activationData.backupCodes"
                    :key="index"
                    class="bg-white p-2 rounded border border-gray-200 text-center"
                  >
                    {{ code }}
                  </div>
                </div>
              </div>

              <div class="flex gap-3">
                <button
                  @click="downloadBackupCodes"
                  class="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Download Codes
                </button>
                <button
                  @click="copyBackupCodes"
                  class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>

            <div class="border-t pt-4">
              <button
                @click="closeModal"
                class="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
