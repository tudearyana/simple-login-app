<template>
  <div class="update-username-form">
    <h3 class="form-title">Update Username</h3>
    
    <form @submit.prevent="handleSubmit">
      <!-- Current Username Display -->
      <div class="form-group">
        <label class="form-label">Current Username</label>
        <div class="current-value">{{ currentUsername }}</div>
      </div>

      <!-- New Username Input -->
      <div class="form-group">
        <label for="newUsername" class="form-label">
          New Username <span class="required">*</span>
        </label>
        <input
          id="newUsername"
          v-model="newUsername"
          type="text"
          class="form-input"
          :class="{ 'input-error': validationError }"
          placeholder="Enter new username"
          :disabled="loading"
          @input="clearValidationError"
        />
        <div v-if="validationError" class="error-message">
          {{ validationError }}
        </div>
        <div class="input-hint">
          3-50 characters, letters, numbers, and underscores only
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
          :disabled="loading || !newUsername || !!validationError"
        >
          <span v-if="loading" class="spinner"></span>
          <span v-else>Update Username</span>
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
const newUsername = ref('')
const validationError = ref('')

// Computed
const currentUsername = computed(() => userStore.username)
const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)
const successMessage = computed(() => userStore.successMessage)

// Methods
function validateUsername(username) {
  if (!username || username.trim().length === 0) {
    return 'Username is required'
  }
  
  if (username.length < 3) {
    return 'Username must be at least 3 characters'
  }
  
  if (username.length > 50) {
    return 'Username must not exceed 50 characters'
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores'
  }
  
  if (username === currentUsername.value) {
    return 'New username must be different from current username'
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
  const error = validateUsername(newUsername.value)
  if (error) {
    validationError.value = error
    return
  }
  
  try {
    await userStore.updateUsername(newUsername.value)
    // Clear input on success
    newUsername.value = ''
  } catch (err) {
    // Error is already set in store
    console.error('Failed to update username:', err)
  }
}
</script>

<style scoped>
.update-username-form {
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
