import { createSlice, type PayloadAction} from '@reduxjs/toolkit'
import type{ User, LoginResponse } from './types'
import { tokenStore } from '@/lib/tokens'

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isIntitializing: boolean
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: Boolean(tokenStore.getAccess()),
    isIntitializing: Boolean(tokenStore.getAccess()),
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        credentialsReceived(state, action: PayloadAction<LoginResponse>){
            const { access, refresh, user } = action.payload
            tokenStore.set(access, refresh)
            state.user = user
            state.isAuthenticated = true
            state.isIntitializing = false
        },

        // Session restored from a stored token on page load.
        userLoaded(state, action: PayloadAction<User>) {
            state.user = action.payload
            state.isAuthenticated = true
            state.isIntitializing = false
        },

        loggedOut(state) {
            tokenStore.clear()
            state.user = null
            state.isAuthenticated = false
            state.isIntitializing = false
        },
    },
})

export const { credentialsReceived, userLoaded, loggedOut } = authSlice.actions
export default authSlice.reducer
