<template>
    <div class="login-page">
        <div class="card p-5 has-text-centered">
            <h1 class="title is-4">Admin Login</h1>
            <p class="mb-4">Please sign in with your Google account to access the admin panel.</p>

            <button
                class="button is-primary is-light is-fullwidth"
                @click="handleLogin"
                :disabled="authStore.isAuthLoading"
            >
                <span class="icon">
                    <i class="fab fa-google"></i>
                </span>
                <span>Sign in with Google</span>
            </button>

            <p v-if="authStore.isAuthLoading" class="mt-3">Loading...</p>
        </div>
    </div>
</template>

<script>
import { useAuthStore } from '../stores/auth'

export default {
    data() {
        return {
            authStore: null
        }
    },
    beforeMount() {
        this.authStore = useAuthStore()
    },
    methods: {
        async handleLogin() {
            // Store the path the user was trying to access before coming to login
            const redirectTo = this.$route.query.redirect || '/admin'

            const success = await this.authStore.signInWithGoogle()
            if (success) {
                if (this.authStore.isAdmin) {
                    // If successful and admin, redirect to the page they wanted (likely /admin)
                    this.$router.replace(redirectTo) // Use replace to avoid keeping /login in history
                } else {
                    // If successful but NOT admin, alert and redirect to home
                    alert('Logged in but not an admin. Redirecting to product page.')
                    this.$router.replace('/product')
                }
            } else {
                alert('Google Sign-In failed. Please try again.')
            }
        }
    },
    mounted() {
        if (this.authStore.isAuthenticated && !this.authStore.isAuthLoading) {
            if (this.authStore.isAdmin) {
                this.$router.replace('/admin')
            } else {
                this.$router.replace('/product')
            }
        }
    }
}
</script>

<style scoped>
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5; /* Light background */
}
.card {
    max-width: 400px;
    width: 90%;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
}
</style>