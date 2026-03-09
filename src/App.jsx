import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Layout from './components/Layout'
import CookiePopup from './components/CookiePopup'
import Projects from './pages/Projects'
import DeletedProjects from './pages/DeletedProjects'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import { useEffect, useState, createContext, useContext } from 'react'
import { tokenManager } from './api/api'
import api from './api/api'
import { FilterProvider } from './contexts/FilterContext'

// Create Auth Context
export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Load user data from localStorage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        console.log('📦 Loaded user data from localStorage:', userData)
        setUser(userData)
      } catch (error) {
        console.log('⚠️ Error parsing stored user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  const checkAuth = async () => {
    // Don't check auth if user is logging out
    if (isLoggingOut || window.isLoggingOut) {
      console.log('🚫 Skipping auth check during logout')
      setLoading(false)
      return
    }
    
    // Don't auto-redirect if user just logged out
    if (sessionStorage.getItem('justLoggedOut') === 'true') {
      console.log('🚫 User just logged out, skipping auto-redirect')
      sessionStorage.removeItem('justLoggedOut')
      setIsAuthenticated(false)
      setLoading(false)
      return
    }
    
    const token = tokenManager.getToken()
    console.log('🔐 Checking authentication:', token ? 'Token found' : 'No token')
    console.log('🔐 Current URL:', window.location.pathname)
    
    if (token) {
      try {
        // Check if token is expired by decoding it
        const payload = JSON.parse(atob(token.split('.')[1]))
        const now = Date.now() / 1000
        console.log('⏰ Token expires at:', new Date(payload.exp * 1000).toLocaleString())
        console.log('⏰ Current time:', new Date().toLocaleString())
        
        if (payload.exp < now) {
          console.log('❌ Token expired - removing and redirecting to login')
          tokenManager.removeToken()
          setIsAuthenticated(false)
          setLoading(false)
          return
        }
        
        // For now, trust the token if it's not expired
        // But also fetch user data to set in context
        console.log('✅ Token is valid - fetching user data')
        tokenManager.setToken(token) // Set in axios defaults
        setIsAuthenticated(true)
        
        // Fetch user data from /me endpoint
        try {
          const response = await api.get('/me')
          
          if (response.status === 200) {
            const userData = response.data
            console.log('✅ User data fetched:', userData)
            setUser(userData)
            // Save user data to localStorage for persistence
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('💾 Saved fresh user data to localStorage:', userData)
          } else {
            console.log('⚠️ Could not fetch user data, but token is valid')
          }
        } catch (error) {
          console.log('⚠️ Error fetching user data:', error)
        }
        
        setLoading(false)
        return
      } catch (error) {
        console.error('❌ Token validation error:', error)
        // If there's an error decoding the token, remove it
        tokenManager.removeToken()
        setIsAuthenticated(false)
      }
    } else {
      console.log('❌ No token found')
      setIsAuthenticated(false)
    }
    setLoading(false)
  }

  const login = (token, userData) => {
    console.log('🔐 Logging in user...')
    tokenManager.setToken(token)
    setIsAuthenticated(true)
    if (userData) {
      setUser(userData)
      // Save user data to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('💾 Saved user data to localStorage:', userData)
    }
  }

  const logout = () => {
    console.log('🚪 Logging out user...')
    setIsLoggingOut(true) // Set logout flag to prevent re-authentication
    tokenManager.removeToken()
    setIsAuthenticated(false)
    setUser(null)
    // Clear all authentication-related data from localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    // Add logout flag to session storage to prevent auto-redirect
    sessionStorage.setItem('justLoggedOut', 'true')
    // Add global flag as backup
    window.isLoggingOut = true
    console.log('🗑️ Cleared all auth data from localStorage')
    console.log('🔐 Authentication state set to false')
    
    // Reset logout flag after a short delay
    setTimeout(() => {
      setIsLoggingOut(false)
      window.isLoggingOut = false
    }, 3000)
  }

  useEffect(() => {
    // Only check auth if not logging out and not just logged out
    if (!isLoggingOut && sessionStorage.getItem('justLoggedOut') !== 'true') {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [isLoggingOut]) // Add isLoggingOut dependency

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, checkAuth, user, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <FilterProvider>
          <AppContent />
        </FilterProvider>
      </AuthProvider>
    </Provider>
  )
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  // Don't show any loading screen - let components handle their own loading
  if (loading) {
    return null
  }

  console.log('🔄 AppContent rendering - isAuthenticated:', isAuthenticated)

  return (
    <>
      <CookiePopup />
      <BrowserRouter>
        <Routes>
          {/* Auth routes - redirect to dashboard if already authenticated */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          
          {/* Protected routes with layout - redirect to login if not authenticated */}
          <Route path="/dashboard" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
            <Route index element={<Projects />} />
            <Route path="projects" element={<Projects />} />
            <Route path="deleted-projects" element={<DeletedProjects />} />
            <Route path="project/:projectId/*" element={<Dashboard />} />
          </Route>
          
          {/* Catch all route - redirect to appropriate page based on auth */}
          <Route path="*" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
