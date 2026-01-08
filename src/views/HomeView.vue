<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  try {
    console.log('Logout button clicked')
    await authStore.logout()
    console.log('Logout successful, redirecting to login')
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Tetap redirect ke login meskipun error
    router.push('/login')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-12 pt-16">
    <main>
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="overflow-hidden rounded-lg bg-white shadow">
          <div class="px-4 py-5 sm:p-6">
            <div class="text-center">
              <h1 class="text-3xl font-bold leading-9 text-gray-900 mb-4">
                Welcome, {{ authStore.user?.name || 'User' }}!
              </h1>
              <p class="text-lg text-gray-500 mb-8">
                You have successfully logged in to the dashboard.
              </p>
              
              <div class="flex gap-4 justify-center mb-6">
                <RouterLink
                  to="/user-management"
                  class="inline-flex items-center rounded-md border border-indigo-600 bg-white px-6 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  User Management
                </RouterLink>
                <RouterLink
                  to="/about"
                  class="inline-flex items-center rounded-md border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  About
                </RouterLink>
              </div>
              
              <button 
                @click="handleLogout"
                class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
