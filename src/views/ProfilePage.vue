<template>
  <div class="profile-page">
    <div class="profile-container">
      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title">My Profile</h1>
        <p class="page-subtitle">Manage your account settings and preferences</p>
      </div>

      <!-- Loading State -->
      <div v-if="initialLoading" class="loading-container">
        <div class="spinner-large"></div>
        <p>Loading profile...</p>
      </div>

      <!-- Profile Content -->
      <div v-else-if="hasProfile" class="profile-content">
        <!-- Profile Info Card -->
        <div class="profile-info-card">
          <h2 class="card-title">Profile Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">User ID</span>
              <span class="info-value">{{ userId }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Username</span>
              <span class="info-value">{{ username }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">{{ email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="status-badge" :class="statusClass">{{ userStatus }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">2FA Status</span>
              <span class="status-badge" :class="twoFactorClass">{{ twoFactorStatus }}</span>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <div class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              class="tab"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Update Username Tab -->
            <div v-if="activeTab === 'username'" class="tab-panel">
              <UpdateUsernameForm />
            </div>

            <!-- Update Email Tab -->
            <div v-if="activeTab === 'email'" class="tab-panel">
              <UpdateEmailForm />
            </div>

            <!-- Change Password Tab -->
            <div v-if="activeTab === 'password'" class="tab-panel">
              <ChangePasswordForm />
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="profileError" class="error-container">
        <div class="error-icon">⚠️</div>
        <h3>Failed to Load Profile</h3>
        <p>{{ profileError }}</p>
        <button class="btn btn-primary" @click="loadProfile">
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import UpdateUsernameForm from '../components/UpdateUsernameForm.vue'
import UpdateEmailForm from '../components/UpdateEmailForm.vue'
import ChangePasswordForm from '../components/ChangePasswordForm.vue'

const userStore = useUserStore()

// Local state
const activeTab = ref('username')
const initialLoading = ref(true)

const tabs = [
  { id: 'username', label: 'Update Username' },
  { id: 'email', label: 'Update Email' },
  { id: 'password', label: 'Change Password' }
]

// Computed
const hasProfile = computed(() => userStore.hasProfile)
const username = computed(() => userStore.username)
const email = computed(() => userStore.email)
const userStatus = computed(() => userStore.userStatus)
const twoFactorStatus = computed(() => userStore.twoFactorStatus)
const userId = computed(() => userStore.userId)
const profileError = computed(() => userStore.error)

const statusClass = computed(() => {
  return userStatus.value === 'ACTIVE' ? 'status-active' : 'status-inactive'
})

const twoFactorClass = computed(() => {
  return twoFactorStatus.value === 'ACTIVE' ? 'status-active' : 'status-inactive'
})

// Methods
async function loadProfile() {
  initialLoading.value = true
  try {
    await userStore.fetchProfile()
  } catch (error) {
    console.error('Failed to load profile:', error)
  } finally {
    initialLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.profile-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: #666;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner-large {
  display: inline-block;
  width: 48px;
  height: 48px;
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-container h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1a1a1a;
}

.error-container p {
  margin: 0 0 24px 0;
  color: #666;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-info-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  color: #1a1a1a;
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-inactive {
  background: #f8d7da;
  color: #721c24;
}

.tabs-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.tab {
  flex: 1;
  padding: 16px 24px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab:hover {
  background: #f0f0f0;
  color: #333;
}

.tab.active {
  color: #3498db;
  border-bottom-color: #3498db;
  background: white;
}

.tab-content {
  padding: 24px;
}

.tab-panel {
  animation: fadeIn 0.3s;
}

.btn {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    border-bottom: 1px solid #e0e0e0;
    border-left: 3px solid transparent;
  }

  .tab.active {
    border-bottom-color: #e0e0e0;
    border-left-color: #3498db;
  }
}
</style>
