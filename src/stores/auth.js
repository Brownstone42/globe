import { defineStore } from 'pinia'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { db } from '../firebase' // Assuming firebase.js is in src/
import { doc, getDoc } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        isAdmin: false,
        authLoading: true,
        adminEmails: import.meta.env.VITE_ADMIN_EMAILS ? import.meta.env.VITE_ADMIN_EMAILS.split(',') : []
    }),
    getters: {
        isAuthenticated: (state) => !!state.user,
        currentUser: (state) => state.user,
        isAuthLoading: (state) => state.authLoading
    },
    actions: {
        async initializeAuth() {
            this.authLoading = true
            const auth = getAuth()

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    this.user = user
                    this.isAdmin = this.adminEmails.includes(user.email)
                } else {
                    this.user = null
                    this.isAdmin = false
                }
                this.authLoading = false
            })
        },
        async signInWithGoogle() {
            this.authLoading = true
            const auth = getAuth()
            const provider = new GoogleAuthProvider()

            try {
                const result = await signInWithPopup(auth, provider)
                // This is the Google-authenticated user.
                this.user = result.user
                // Check admin status immediately after login
                this.isAdmin = this.adminEmails.includes(this.user.email)

                console.log('Signed in as:', this.user.email, 'Admin:', this.isAdmin)
                return true // Indicate success
            } catch (error) {
                console.error('Error signing in with Google:', error)
                this.user = null
                this.isAdmin = false
                return false // Indicate failure
            } finally {
                this.authLoading = false
            }
        },
        async signOutUser() {
            this.authLoading = true
            const auth = getAuth()

            try {
                await signOut(auth)
                this.user = null
                this.isAdmin = false
                console.log('Signed out')
                return true // Indicate success
            } catch (error) {
                console.error('Error signing out:', error);
                return false; // Indicate failure
            } finally {
                this.authLoading = false
            }
        }
    }
})