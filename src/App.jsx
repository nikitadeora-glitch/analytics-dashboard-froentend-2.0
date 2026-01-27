import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import Layout from './components/Layout'
import CookiePopup from './components/CookiePopup'
import Projects from './pages/Projects'
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

  const checkAuth = () => {
    const token = tokenManager.getToken()
    console.log('🔐 Checking authentication:', token ? 'Token found' : 'No token')
    
    if (token) {
      setIsAuthenticated(true)
      tokenManager.setToken(token) // Set in axios defaults
    } else {
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

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white'
      }}>
        <div style={{
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #ffffff',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Loading...
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
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
            <Route path="project/:projectId/*" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
