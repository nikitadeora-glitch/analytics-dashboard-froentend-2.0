import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authAPI } from '../api/api'
import logo from '/favicon.png'
import backgroundImage from '../assets/analytic.png'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await authAPI.forgotPassword({ email })
      setEmailSent(true)
    } catch (error) {
      console.error('Forgot password error:', error)
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  if (emailSent) {
    return (
      <div className="forgot-password-container" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29 0%, #24243e 25%, #302b63 50%, #0f3460 75%, #0a2472 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          width: '100%',
          maxWidth: '1200px',
          height: '600px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>

          <div style={{
            flex: '1',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative'
          }}>
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
                Email Sent Successfully
              </h2>
              <p style={{
                fontSize: '18px',
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
              }}>
                Check your inbox for the reset link
              </p>
            </div>
          </div>

          <div style={{
            flex: '1',
            backgroundColor: 'white',
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <CheckCircle size={64} style={{ color: '#10b981' }} />
            </div>

            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 16px 0'
            }}>
              Check Your Email
            </h1>

            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: '0 0 24px 0',
              lineHeight: '1.5'
            }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>

            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 32px 0',
              lineHeight: '1.5'
            }}>
              Please check your email and click the link to reset your password.
              If you don't see the email, check your spam folder.
            </p>

            <button
              onClick={handleBackToLogin}
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
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>

            <div style={{ marginTop: '24px' }}>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                margin: '0 0 8px 0'
              }}>
                Didn't receive the email?{' '}
                <button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#302b63',
                    textDecoration: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="forgot-password-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #24243e 25%, #302b63 50%, #0f3460 75%, #0a2472 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1200px',
        height: '600px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>

        <div style={{
          flex: '1',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}>
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
              Reset Password
            </h2>
            <p style={{
              fontSize: '18px',
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              Secure your account with a new password
            </p>
          </div>
        </div>

        <div style={{
          flex: '1',
          backgroundColor: 'white',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
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
              Forgot Password?
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#64748b',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

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

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
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
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '24px'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={handleBackToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#302b63',
                textDecoration: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                margin: '0 auto'
              }}
            >
              <ArrowLeft size={14} />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword