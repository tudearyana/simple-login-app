// Contoh penggunaan API endpoints untuk berbagai skenario

import { authService } from '@/services/authService'

// ===== 1. REGISTER USER =====
export async function exampleRegister() {
  try {
    const response = await authService.register({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123'
    })
    
    console.log('Register response:', response)
    
    if (response.requiresActivation) {
      // Redirect ke halaman aktivasi atau tampilkan pesan
      console.log('Please check your email for activation')
    } else if (response.token) {
      // Langsung berhasil login
      console.log('Registration successful, logged in')
    }
  } catch (error) {
    console.error('Registration error:', error)
  }
}

// ===== 2. LOGIN =====
export async function exampleLogin() {
  try {
    const response = await authService.login({
      email: 'john@example.com',
      password: 'securePassword123'
    })
    
    console.log('Login successful:', response)
    // Token sudah otomatis tersimpan di localStorage oleh authService
  } catch (error) {
    console.error('Login error:', error)
  }
}

// ===== 3. ACTIVATE ACCOUNT =====
export async function exampleActivate() {
  try {
    const response = await authService.activate({
      // Sesuaikan dengan format yang diharapkan backend
      token: 'activation-token-from-email',
      // atau
      code: '123456',
      email: 'john@example.com'
    })
    
    console.log('Activation successful:', response)
  } catch (error) {
    console.error('Activation error:', error)
  }
}

// ===== 4. VALIDATE TOTP (Two-Factor Authentication) =====
export async function exampleValidateTotp() {
  try {
    const response = await authService.validateTotp({
      code: '123456', // 6-digit TOTP code
      userId: 1, // atau ambil dari store
      // Sesuaikan dengan format backend
    })
    
    console.log('TOTP validation successful:', response)
    // Token baru akan otomatis tersimpan jika ada di response
  } catch (error) {
    console.error('TOTP validation error:', error)
  }
}

// ===== 5. VALIDATE BACKUP CODE =====
export async function exampleValidateBackup() {
  try {
    const response = await authService.validateBackup({
      code: 'backup-code-123', // Backup code
      userId: 1, // atau ambil dari store
    })
    
    console.log('Backup code validation successful:', response)
    // Token baru akan otomatis tersimpan jika ada di response
  } catch (error) {
    console.error('Backup code validation error:', error)
  }
}

// ===== 6. LOGOUT =====
export async function exampleLogout() {
  try {
    await authService.logout()
    console.log('Logout successful')
    // Token dan user data sudah otomatis dihapus
  } catch (error) {
    console.error('Logout error:', error)
    // Tetap akan menghapus local data meskipun API error
  }
}

// ===== CONTOH PENGGUNAAN DI COMPONENT VUE =====
/*
<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const totpCode = ref('')

// Login dengan TOTP
const handleLoginWithTotp = async () => {
  try {
    // Step 1: Login biasa
    const loginSuccess = await authStore.login(email.value, password.value)
    
    if (loginSuccess) {
      // Step 2: Jika backend memerlukan TOTP, minta user input TOTP
      // (biasanya backend akan return response khusus yang menunjukkan perlu TOTP)
      const totpResult = await authStore.validateTotp({
        code: totpCode.value,
        userId: authStore.user.id
      })
      
      if (totpResult.success) {
        router.push('/')
      }
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>
*/
