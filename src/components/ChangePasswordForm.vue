<template>
  <div class="change-password-form">
    <h3 class="form-title">Change Password</h3>
    
    <form @submit.prevent="handleSubmit">
      <!-- Current Password -->
      <div class="form-group">
        <label for="currentPassword" class="form-label">
          Current Password <span class="required">*</span>
        </label>
        <div class="password-input-wrapper">
          <input
            id="currentPassword"
            v-model="currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'input-error': validationErrors.currentPassword }"
            placeholder="Enter current password"
            :disabled="loading"
            @input="clearFieldError('currentPassword')"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showCurrentPassword = !showCurrentPassword"
            :disabled="loading"
          >
            {{ showCurrentPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
        <div v-if="validationErrors.currentPassword" class="error-message">
          {{ validationErrors.currentPassword }}
        </div>
      </div>

      <!-- New Password -->
      <div class="form-group">
        <label for="newPassword" class="form-label">
          New Password <span class="required">*</span>
        </label>
        <div class="password-input-wrapper">
          <input
            id="newPassword"
            v-model="newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'input-error': validationErrors.newPassword }"
            placeholder="Enter new password"
            :disabled="loading"
            @input="clearFieldError('newPassword')"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showNewPassword = !showNewPassword"
            :disabled="loading"
          >
            {{ showNewPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
        <div v-if="validationErrors.newPassword" class="error-message">
          {{ validationErrors.newPassword }}
        </div>
        <div class="input-hint">
          Minimum 8 characters
        </div>
      </div>

      <!-- Confirm New Password -->
      <div class="form-group">
        <label for="confirmPassword" class="form-label">
          Confirm New Password <span class="required">*</span>
        </label>
        <div class="password-input-wrapper">
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'input-error': validationErrors.confirmPassword }"
            placeholder="Confirm new password"
            :disabled="loading"
            @input="clearFieldError('confirmPassword')"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showConfirmPassword = !showConfirmPassword"
            :disabled="loading"
          >
            {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
          </button>
        </div>
        <div v-if="validationErrors.confirmPassword" class="error-message">
          {{ validationErrors.confirmPassword }}
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <!-- Success Display -->
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Submit Button -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Change Password</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// Local state
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const validationErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)
const successMessage = computed(() => userStore.successMessage)

const isFormValid = computed(() => {
  return currentPassword.value && 
         newPassword.value && 
         confirmPassword.value &&
         !validationErrors.currentPassword &&
         !validationErrors.newPassword &&
         !validationErrors.confirmPassword
})

// Methods
function validateForm() {
  let isValid = true
  
  // Reset errors
  validationErrors.currentPassword = ''
  validationErrors.newPassword = ''
  validationErrors.confirmPassword = ''
  
  // Validate current password
  if (!currentPassword.value || currentPassword.value.trim().length === 0) {
    validationErrors.currentPassword = 'Current password is required'
    isValid = false
  }
  
  // Validate new password
  if (!newPassword.value || newPassword.value.trim().length === 0) {
    validationErrors.newPassword = 'New password is required'
    isValid = false
  } else if (newPassword.value.length < 8) {
    validationErrors.newPassword = 'Password must be at least 8 characters'
    isValid = false
  } else if (newPassword.value === currentPassword.value) {
    validationErrors.newPassword = 'New password must be different from current password'
    isValid = false
  }
  
  // Validate confirm password
  if (!confirmPassword.value || confirmPassword.value.trim().length === 0) {
    validationErrors.confirmPassword = 'Please confirm your new password'
    isValid = false
  } else if (confirmPassword.value !== newPassword.value) {
    validationErrors.confirmPassword = 'Passwords do not match'
    isValid = false
  }
  
  return isValid
}

function clearFieldError(field) {
  validationErrors[field] = ''
  userStore.clearMessages()
}

async function handleSubmit() {
  // Clear previous messages
  userStore.clearMessages()
  
  // Validate
  if (!validateForm()) {
    return
  }
  
  try {
    await userStore.updatePassword(currentPassword.value, newPassword.value)
    
    // Clear form on success
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    showCurrentPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false
  } catch (err) {
    // Error is already set in store
    console.error('Failed to change password:', err)
  }
}
</script>

<style scoped>
.change-password-form {
  max-width: 500px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-title {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #e74c3c;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  flex: 1;
  padding: 10px 40px 10px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.form-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.input-error {
  border-color: #e74c3c;
}

.toggle-password {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.toggle-password:hover:not(:disabled) {
  opacity: 1;
}

.toggle-password:disabled {
  cursor: not-allowed;
}

.input-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.error-message {
  margin-top: 6px;
  font-size: 13px;
  color: #e74c3c;
}

.alert {
  padding: 12px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 14px;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert-success {
  background: #efe;
  color: #3c3;
  border: 1px solid #cfc;
}

.form-actions {
  margin-top: 24px;
}

.btn {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 140px;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
