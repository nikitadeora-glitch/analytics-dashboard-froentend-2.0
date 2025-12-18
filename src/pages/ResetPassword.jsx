import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import { authAPI } from '../api/api'
import logo from '/favicon.png'
import backgroundImage from '../assets/analytic.png'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState([])
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [tokenValid, setTokenValid] = useState(null)
  const [tokenLoading, setTokenLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password')
      return
    }

    // Step 7: Verify token when page loads
    const verifyToken = async () => {
      try {
        setTokenLoading(true)
        const response = await authAPI.verifyResetToken(token)
        setTokenValid(true)
        setUserEmail(response.data.user_email)
        console.log('✅ Token verified successfully')
      } catch (error) {
        console.error('❌ Token verification failed:', error)
        setTokenValid(false)
        setError(error.response?.data?.detail || 'Invalid or expired reset link')
      } finally {
        setTokenLoading(false)
      }
    }

    verifyToken()
  }, [token, navigate])

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

    // Validate password
    const passwordValidationErrors = validatePassword(formData.password)
    if (passwordValidationErrors.length > 0) {
      setError('Password does not meet requirements.')
      setLoading(false)
      return
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    try {
      await authAPI.resetPassword({
        token: token,
        password: formData.password
      })
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      console.error('Reset password error:', error)
      setError(error.response?.data?.detail || 'Failed to reset password. The link may be expired.')
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
      
      // Check confirm password match if it exists
      if (formData.confirmPassword) {
        setConfirmPasswordError(
          value !== formData.confirmPassword ? 'Passwords do not match' : ''
        )
      }
    }

    // Real-time confirm password validation
    if (name === 'confirmPassword') {
      setConfirmPasswordError(
        value !== formData.password ? 'Passwords do not match' : ''
      )
    }
  }

  // Show loading state while verifying token
  if (tokenLoading) {
    return (
      <div className="reset-password-container" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #24243e 25%, #302b63 50%, #0f3460 75%, #0a2472 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '48px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #302b63',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{ color: '#1e293b', margin: '0 0 8px 0' }}>Verifying Reset Link</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Please wait while we verify your reset token...</p>
        </div>
      </div>
    )
  }

  // Show error state for invalid token
  if (tokenValid === false) {
    return (
      <div className="reset-password-container" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #24243e 25%, #302b63 50%, #0f3460 75%, #0a2472 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '48px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '500px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            color: '#dc2626',
            fontSize: '24px'
          }}>
            ❌
          </div>
          <h2 style={{ color: '#1e293b', margin: '0 0 16px 0' }}>Link Expired or Invalid</h2>
          <p style={{ color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5' }}>
            This password reset link has expired or is invalid. Please request a new password reset link.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="reset-password-container" style={{
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
                Password Reset Complete
              </h2>
              <p style={{
                fontSize: '18px',
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
              }}>
                Your password has been updated successfully
              </p>
            </div>
          </div>

          {/* Right side - Success Message */}
          <div style={{
            flex: '1',
            backgroundColor: 'white',
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            {/* Success Icon */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <CheckCircle 
                size={64} 
                style={{
                  color: '#10b981'
                }}
              />
            </div>

            {/* Success Message */}
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 16px 0'
            }}>
              Password Reset Successful!
            </h1>
            
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: '0 0 24px 0',
              lineHeight: '1.5'
            }}>
              Your password has been updated successfully. You can now login with your new password.
            </p>

            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 32px 0'
            }}>
              Redirecting to login page in 3 seconds...
            </p>

            {/* Login Button */}
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reset-password-container" style={{
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
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
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
              Create New Password
            </h2>
            <p style={{
              fontSize: '18px',
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              Enter a strong password for your account
            </p>
          </div>
        </div>

        {/* Right side - Reset Password Form */}
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
              style={{
                width: '120px',
                height: '114px',
              }}
            />
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '8px 0 0 0'
            }}>
              Reset Password
            </h1>
            {userEmail && (
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '4px 0 0 0'
              }}>
                for {userEmail}
              </p>
            )}
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

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                New Password
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
                  placeholder="Enter new password"
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
                  onFocus={(e) => e.target.style.borderColor = '#302b63'}
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

              {/* Password Requirements */}
              {passwordErrors.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#dc2626'
                }}>
                  Password must have:
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    {passwordErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Confirm New Password
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    border: `2px solid ${confirmPasswordError ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'border-color 0.2s',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = confirmPasswordError ? '#ef4444' : '#302b63'}
                  onBlur={(e) => e.target.style.borderColor = confirmPasswordError ? '#ef4444' : '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Confirm Password Error */}
              {confirmPasswordError && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '12px',
                  color: '#dc2626'
                }}>
                  {confirmPasswordError}
                </div>
              )}
            </div>

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={loading || passwordErrors.length > 0 || confirmPasswordError}
              style={{
                width: '100%',
                padding: '12px',
                background: (loading || passwordErrors.length > 0 || confirmPasswordError) ? '#9ca3af' : 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (loading || passwordErrors.length > 0 || confirmPasswordError) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading && passwordErrors.length === 0 && !confirmPasswordError) {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 8px 25px rgba(48, 43, 99, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && passwordErrors.length === 0 && !confirmPasswordError) {
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
                  Updating Password...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Add spinning animation and responsive styles */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .reset-password-container > div {
              flex-direction: column !important;
              height: auto !important;
            }
            .reset-password-container > div > div:first-child {
              height: 200px !important;
            }
            .reset-password-container > div > div:last-child {
              padding: 24px !important;
            }
          }
          
          @media (max-width: 480px) {
            .reset-password-container {
              padding: 10px !important;
            }
            .reset-password-container > div {
              border-radius: 10px !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default ResetPassword