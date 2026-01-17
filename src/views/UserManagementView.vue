<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { authService } from '../services/authService'
import QRCodeVue from 'qrcode.vue'

const authStore = useAuthStore()
const userProfile = ref(null)
const loading = ref(true)
const showActivationModal = ref(false)
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const activating = ref(false)
const updating = ref(false)
const changingPassword = ref(false)
const error = ref('')
const successMessage = ref('')

// Edit form data
const editForm = ref({
  userId: 0,
  username: '',
  email: '',
  status: ''
})

// Original profile data for comparison
const originalProfile = ref({
  username: '',
  email: ''
})

// Password form data
const passwordForm = ref({
  userId: 0,
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const fetchUserProfile = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const profile = await authService.getUserProfile()
    userProfile.value = profile
    console.log('User profile loaded:', profile)
  } catch (err) {
    console.error('Failed to load user profile:', err)
    error.value = 'Failed to load user profile'
  } finally {
    loading.value = false
  }
}

const openEditModal = () => {
  if (!userProfile.value) return
  
  editForm.value = {
    userId: userProfile.value.id,
    username: userProfile.value.username,
    email: userProfile.value.email,
    status: userProfile.value.status
  }
  
  // Store original values for comparison
  originalProfile.value = {
    username: userProfile.value.username,
    email: userProfile.value.email
  }
  
  showEditModal.value = true
  error.value = ''
  successMessage.value = ''
}

const closeEditModal = () => {
  showEditModal.value = false
  error.value = ''
  successMessage.value = ''
}

const handleUpdateProfile = async () => {
  error.value = ''
  successMessage.value = ''
  updating.value = true
  
  try {
    // Check what actually changed
    const usernameChanged = editForm.value.username !== originalProfile.value.username
    const emailChanged = editForm.value.email !== originalProfile.value.email
    
    if (!usernameChanged && !emailChanged) {
      error.value = 'No changes detected'
      updating.value = false
      return
    }
    
    // Only send data that changed
    const updateData = {
      userId: editForm.value.userId,
      username: usernameChanged ? editForm.value.username : null,
      email: emailChanged ? editForm.value.email : null
    }
    
    console.log('Updating profile with changes:', { usernameChanged, emailChanged })
    await authService.updateUser(updateData)
    successMessage.value = 'Profile updated successfully!'
    await fetchUserProfile() // Refresh profile
    setTimeout(() => {
      closeEditModal()
    }, 1500)
  } catch (err) {
    error.value = err.responseMessage || err.message || 'Failed to update profile'
  } finally {
    updating.value = false
  }
}

const openPasswordModal = () => {
  if (!userProfile.value) return
  
  passwordForm.value = {
    userId: userProfile.value.id,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showPasswordModal.value = true
  error.value = ''
  successMessage.value = ''
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.value = {
    userId: 0,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  error.value = ''
  successMessage.value = ''
}

const handleChangePassword = async () => {
  error.value = ''
  successMessage.value = ''
  
  // Validation
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    error.value = 'Please fill in all password fields'
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error.value = 'New password and confirmation do not match'
    return
  }
  
  if (passwordForm.value.newPassword.length < 3) {
    error.value = 'New password must be at least 3 characters'
    return
  }
  
  changingPassword.value = true
  
  try {
    await authService.changePassword({
      userId: passwordForm.value.userId,
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    successMessage.value = 'Password changed successfully!'
    setTimeout(() => {
      closePasswordModal()
    }, 1500)
  } catch (err) {
    error.value = err.responseMessage || err.message || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

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
    // Refresh profile after activation
    await fetchUserProfile()
  } catch (err) {
    error.value = err.message || 'Activation failed'
  } finally {
    activating.value = false
  }
}

const handleDisable2FA = async () => {
  if (!userProfile.value?.id) {
    error.value = 'User ID not found'
    return
  }

  // Confirmation dialog
  if (!confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) {
    return
  }

  activating.value = true
  error.value = ''

  try {
    await authService.disable2FA(userProfile.value.id)
    successMessage.value = '2FA disabled successfully'
    // Refresh profile after disabling
    await fetchUserProfile()
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    error.value = err.message || 'Failed to disable 2FA'
  } finally {
    activating.value = false
  }
}

const handle2FAToggle = () => {
  if (userProfile.value?.twoFactorStatus === 'ACTIVE') {
    handleDisable2FA()
  } else {
    handleActivate2FA()
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

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  fetchUserProfile()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-800 mb-8">User Profile</h1>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error && !userProfile" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        {{ error }}
      </div>

      <!-- User Profile Card -->
      <div v-else-if="userProfile" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">User Information</h2>
          <div class="flex gap-2">
            <button
              @click="openEditModal"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              Edit Profile
            </button>
            <button
              @click="openPasswordModal"
              class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
            >
              Change Password
            </button>
          </div>
        </div>
        
        <div class="space-y-3">
          <div class="flex items-center">
            <span class="font-medium text-gray-700 w-40">User ID:</span>
            <span class="text-gray-900">{{ userProfile.id }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium text-gray-700 w-40">Username:</span>
            <span class="text-gray-900">{{ userProfile.username }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium text-gray-700 w-40">Email:</span>
            <span class="text-gray-900">{{ userProfile.email }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium text-gray-700 w-40">Status:</span>
            <span 
              :class="userProfile.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ userProfile.status }}
            </span>
          </div>
          <div class="flex items-center">
            <span class="font-medium text-gray-700 w-40">2FA Status:</span>
            <span 
              :class="userProfile.twoFactorStatus === 'ACTIVE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'"
              class="px-3 py-1 rounded-full text-sm font-medium"
            >
              {{ userProfile.twoFactorStatus }}
            </span>
          </div>
         <!-- <div class="flex items-center">
            <span class="font-medium text-gray-700 w-40">Created At:</span>
            <span class="text-gray-900">{{ formatDate(userProfile.createdAt) }}</span>
          </div>
          <div class="flex items-center">
            <span class="font-medium text-gray-700 w-40">Updated At:</span>
            <span class="text-gray-900">{{ formatDate(userProfile.updatedAt) }}</span>
          </div>
          <div v-if="userProfile.updatedBy" class="flex items-center">
            <span class="font-medium text-gray-700 w-40">Updated By:</span>
            <span class="text-gray-900">{{ userProfile.updatedBy }}</span>
          </div> -->
        </div>
      </div>

      <!-- 2FA Section -->
      <div v-if="userProfile" class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Two-Factor Authentication</h2>
        
        <p class="text-gray-600 mb-4">
          <template v-if="userProfile.twoFactorStatus === 'ACTIVE'">
            Two-factor authentication is currently <strong class="text-green-600">enabled</strong> for your account.
            You can disable it if needed.
          </template>
          <template v-else>
            Enhance your account security by enabling two-factor authentication (2FA). 
            You'll need to scan a QR code with your authenticator app.
          </template>
        </p>

        <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>

        <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {{ successMessage }}
        </div>

        <button
          @click="handle2FAToggle"
          :disabled="activating"
          :class="[
            'px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
            userProfile.twoFactorStatus === 'ACTIVE' 
              ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
          ]"
        >
          <template v-if="activating">
            {{ userProfile.twoFactorStatus === 'ACTIVE' ? 'Disabling...' : 'Activating...' }}
          </template>
          <template v-else>
            {{ userProfile.twoFactorStatus === 'ACTIVE' ? 'Disable 2FA' : 'Activate 2FA' }}
          </template>
        </button>
      </div>

      <!-- Edit Profile Modal -->
      <div
        v-if="showEditModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closeEditModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-2xl font-bold text-gray-800">Edit Profile</h3>
              <button
                @click="closeEditModal"
                class="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {{ error }}
            </div>

            <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {{ successMessage }}
            </div>

            <form @submit.prevent="handleUpdateProfile" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  v-model="editForm.username"
                  type="text"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  v-model="editForm.status"
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="closeEditModal"
                  class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="updating"
                  class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {{ updating ? 'Updating...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Change Password Modal -->
      <div
        v-if="showPasswordModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click.self="closePasswordModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="p-6">
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-2xl font-bold text-gray-800">Change Password</h3>
              <button
                @click="closePasswordModal"
                class="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {{ error }}
            </div>

            <div v-if="successMessage" class="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
              {{ successMessage }}
            </div>

            <form @submit.prevent="handleChangePassword" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="closePasswordModal"
                  class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="changingPassword"
                  class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {{ changingPassword ? 'Changing...' : 'Change Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 2FA Activation Modal -->
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
