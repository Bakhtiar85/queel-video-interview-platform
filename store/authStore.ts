// store/authStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Recruiter } from '@/types'

interface AuthState {
    recruiter: Recruiter | null
    isAuthenticated: boolean
    login: (recruiter: Recruiter) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            recruiter: null,
            isAuthenticated: false,
            login: (recruiter) => set({ recruiter, isAuthenticated: true }),
            logout: () => set({ recruiter: null, isAuthenticated: false })
        }),
        {
            name: 'auth-storage'
        }
    )
)