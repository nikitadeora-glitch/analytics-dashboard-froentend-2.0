import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { authAPI, tokenManager } from '../api/api'
import logo from '/favicon.png'
import backgroundImage from '../assets/analytic.png'

import { useEffect } from "react"



function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordErrors, setPasswordErrors] = useState([])
  const navigate = useNavigate()

  // Password validation function
  const validatePassword = (password) => {
    const errors = []

    if (password.length < 6) {
      errors.push('At least 6 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter')
    }
    if (!/\d/.test(password)) {
      errors.push('One digit')
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('One special character')
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate password before submitting
    const passwordValidationErrors = validatePassword(formData.password)
    if (passwordValidationErrors.length > 0) {
      setError('Password does not meet requirements.')
      setLoading(false)
      return
    }

    try {
      // Call login API
      const response = await authAPI.login(formData)

      // Store token
      tokenManager.setToken(response.data.access_token)

      // On successful login, navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      setError(error.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Real-time password validation
    if (name === 'password') {
      const errors = validatePassword(value)
      setPasswordErrors(errors)
    }
  }

useEffect(() => {
  // Load Google Sign-In script
  const loadGoogleScript = () => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    document.head.appendChild(script)
  }

  const initializeGoogleSignIn = () => {
    if (!window.google) return

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogleLogin
    })

    window.google.accounts.id.renderButton(
      document.getElementById("google-signin-button"),
      {
        theme: "outline",
        size: "large",
        width: "100%"
      }
    )
  }

  loadGoogleScript()
}, [])

const handleGoogleLogin = async (response) => {
  console.log("GOOGLE RESPONSE ", response)

  try {
    const res = await authAPI.googleLogin({
      id_token: response.credential
    })

    console.log("BACKEND RESPONSE 👉", res.data)

    tokenManager.setToken(res.data.access_token)
    navigate("/dashboard")
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR 👉", err)
    setError("Google login failed")
  }
}



  return (
    <div className="login-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #24243e 25%, #302b63 50%, #0f3460 75%, #0a2472 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Main container with two sections */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1200px',
        height: '600px',
        borderRadius: '20px',
        overflow: 'hidden',

      }}>

        {/* Left side - Background Image */}
        <div style={{
          flex: '1',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}>
          {/* Overlay for better text readability */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'white',
            textAlign: 'center',
            padding: '40px'
          }}>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '16px',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}>
              Statify
            </h2>
            <p style={{
              fontSize: '18px',
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              Track, Analyze, and Optimize your website performance
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div style={{
          flex: '1',
          backgroundColor: 'white',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          {/* Logo and Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <img
              src={logo}
              alt="State Counter Logo"
              className="login-logo"
              style={{
                width: '120px',
                height: '114px',
              }}
            />
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 8px 0'
            }}>
              Welcome
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0
            }}>

            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              color: '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} method="post" action="/login">
            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af'
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9ca3af',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

            </div>

            {/* Remember Me & Forgot Password */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '14px',
                color: '#374151',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  style={{
                    marginRight: '8px',
                    width: '16px',
                    height: '16px'
                  }}
                />
                Remember me
              </label>
              <a
                href="/forgot-password"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/forgot-password')
                }}
                style={{
                  fontSize: '14px',
                  color: '#302b63',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || passwordErrors.length > 0}
              style={{
                width: '100%',
                padding: '12px',
                background: (loading || passwordErrors.length > 0) ? '#9ca3af' : 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (loading || passwordErrors.length > 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading && passwordErrors.length === 0) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(48, 43, 99, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && passwordErrors.length === 0) {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = 'none'
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Google Sign-In Button */}
          <div style={{
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <div
              id="google-signin-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#3c4043',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Roboto, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'
                e.target.style.backgroundColor = '#f8f9fa'
              }}
              onMouseLeave={(e) => {
                e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                e.target.style.backgroundColor = '#ffffff'
              }}
              onClick={() => {
                // Handle Google Sign-In
                console.log('Google Sign-In clicked')
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ display: 'block' }}>
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 2.1-1.4 2.82v2.43h2.23c1.3-1.2 2.05-3 2.05-5.05 0-.5-.05-.88-.15-1.25z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.95l-2.23-2.43c-.62.43-1.43.67-2.4.67-1.85 0-3.41-1.25-3.96-2.93H2.8v2.51C4.12 15.37 6.38 17 8.98 17z"/>
                <path fill="#FBBC05" d="M5.02 10.33c-.15-.43-.23-.88-.23-1.33s.08-.9.23-1.33V5.16H2.8C2.3 6.17 2 7.32 2 8.5s.3 2.33.8 3.34l2.22-2.51z"/>
                <path fill="#EA4335" d="M8.98 3.67c1.04 0 1.96.35 2.7.95l1.97-1.97C12.95 1.35 11.14.63 8.98.63 6.38.63 4.12 2.26 2.8 4.16l2.22 2.51c.55-1.68 2.11-2.93 3.96-2.93z"/>
              </svg>
              Sign in with Google
            </div>
          </div>

          {/* Sign Up Link */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
           
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0,
              marginBottom: '10px'
            }}>
              Don't have an account?{' '}
              <a
                href="/signup"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/signup')
                }}
                style={{
                  color: '#302b63',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Add spinning animation and responsive styles */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 1024px) {
            .login-container > div {
              flex-direction: column !important;
              height: auto !important;
              max-width: 500px !important;
              margin: 20px auto !important;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
            }
            /* Branding Section */
            .login-container > div > div:first-child {
              flex: none !important;
              height: 220px !important;
              position: relative !important;
            }
            .login-container > div > div:first-child h2 {
              font-size: 24px !important;
              margin-bottom: 4px !important;
            }
            .login-container > div > div:first-child p {
              font-size: 13px !important;
              max-width: 80% !important;
              margin: 0 auto !important;
            }
            /* Form Section */
            .login-container > div > div:last-child {
              flex: none !important;
              padding: 30px 20px !important;
            }
            .login-logo {
              width: 70px !important;
              height: 67px !important;
              margin-bottom: 10px !important;
            }
            .login-container > div > div:last-child h1 {
              font-size: 20px !important;
            }
          }
          
          @media (max-width: 480px) {
            .login-container {
              padding: 15px !important;
            }
            .login-container > div > div:first-child {
              height: 180px !important;
            }
            .login-container > div > div:first-child h2 {
              font-size: 20px !important;
            }
            .login-container > div > div:first-child p {
              font-size: 11px !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default Login