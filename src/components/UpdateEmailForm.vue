<template>
  <div class="update-email-form">
    <h3 class="form-title">Update Email Address</h3>
    
    <form @submit.prevent="handleSubmit">
      <!-- Current Email Display -->
      <div class="form-group">
        <label class="form-label">Current Email</label>
        <div class="current-value">{{ currentEmail }}</div>
      </div>

      <!-- New Email Input -->
      <div class="form-group">
        <label for="newEmail" class="form-label">
          New Email Address <span class="required">*</span>
        </label>
        <input
          id="newEmail"
          v-model="newEmail"
          type="email"
          class="form-input"
          :class="{ 'input-error': validationError }"
          placeholder="Enter new email address"
          :disabled="loading"
          @input="clearValidationError"
        />
        <div v-if="validationError" class="error-message">
          {{ validationError }}
        </div>
        <div class="input-hint">
          Enter a valid email address
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
          :disabled="loading || !newEmail || !!validationError"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Update Email</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

// Local state
const newEmail = ref('')
const validationError = ref('')

// Computed
const currentEmail = computed(() => userStore.email)
const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)
const successMessage = computed(() => userStore.successMessage)

// Methods
function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return 'Email is required'
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address'
  }
  
  if (email === currentEmail.value) {
    return 'New email must be different from current email'
  }
  
  return null
}

function clearValidationError() {
  validationError.value = ''
  userStore.clearMessages()
}

async function handleSubmit() {
  // Clear previous messages
  userStore.clearMessages()
  validationError.value = ''
  
  // Validate
  const error = validateEmail(newEmail.value)
  if (error) {
    validationError.value = error
    return
  }
  
  try {
    await userStore.updateEmail(newEmail.value)
    // Clear input on success
    newEmail.value = ''
  } catch (err) {
    // Error is already set in store
    console.error('Failed to update email:', err)
  }
}
</script>

<style scoped>
.update-email-form {
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

.current-value {
  padding: 10px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
  font-family: monospace;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
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
