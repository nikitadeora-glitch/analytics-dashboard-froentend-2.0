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

  const checkAuth = async () => {
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
        // This prevents unnecessary API calls on every refresh
        console.log('✅ Token is valid - setting authenticated')
        tokenManager.setToken(token) // Set in axios defaults
        setIsAuthenticated(true)
        setLoading(false)
        return
        
        // Optional: Validate with backend (commented out for faster refresh)
        /*
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          console.log('✅ Token validated successfully')
          tokenManager.setToken(token)
          setIsAuthenticated(true)
        } else if (response.status === 401) {
          console.log('⚠️ Token valid but got 401 - possible server issue')
          await new Promise(resolve => setTimeout(resolve, 2000))
          const retryResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
          })
          if (retryResponse.ok) {
            console.log('✅ Token validated successfully on retry')
            tokenManager.setToken(token)
            setIsAuthenticated(true)
          } else {
            console.log('❌ Token validation failed:', response.status)
            tokenManager.removeToken()
            setIsAuthenticated(false)
          }
        } else {
          console.log('❌ Token validation failed:', response.status)
          tokenManager.removeToken()
          setIsAuthenticated(false)
        }
        */
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

  const login = (token) => {
    tokenManager.setToken(token)
    setIsAuthenticated(true)
  }

  const logout = () => {
    tokenManager.removeToken()
    setIsAuthenticated(false)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
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

  return (
    <>
      <CookiePopup />
      <BrowserRouter>
        <Routes>
          {/* Auth routes - redirect to dashboard if already authenticated */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
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
