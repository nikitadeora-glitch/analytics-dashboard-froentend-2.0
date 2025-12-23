import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logo from '/favicon.png'
import backgroundImage from '../assets/analytic.png'

function TermsOfService() {
  const navigate = useNavigate()

  return (
    <div className="terms-container" style={{
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
        height: '700px',
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
              Terms of Service
            </h2>
            <p style={{
              fontSize: '18px',
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              Our commitment to transparent service
            </p>
          </div>
        </div>

        {/* Right side - Terms Content */}
        <div style={{
          flex: '1',
          backgroundColor: 'white',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => navigate('/signup')}
              style={{
                background: 'none',
                border: 'none',
                color: '#302b63',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <ArrowLeft size={16} />
              Back to Signup
            </button>
          </div>

          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <img
              src={logo}
              alt="State Counter Logo"
              style={{
                width: '80px',
                height: '76px',
              }}
            />
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '8px 0 0 0'
            }}>
              Terms of Service
            </h1>
          </div>

          {/* Terms Content */}
          <div style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#374151'
          }}>
            <p><strong>Last updated:</strong> December 2025</p>

            <h3 style={{ color: '#302b63', marginTop: '24px' }}>1. Acceptance of Terms</h3>
            <p>By accessing and using Statify ("Service"), you accept and agree to be bound by the terms and provision of this agreement.</p>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>2. Use License</h3>
            <p>Permission is granted to temporarily use Statify for personal and commercial website analytics purposes. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose without authorization</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations</li>
            </ul>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>3. Data Collection and Privacy</h3>
            <p>Statify collects website analytics data to provide insights about your website's performance. We are committed to protecting your privacy and handling your data responsibly.</p>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>4. Service Availability</h3>
            <p>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. Scheduled maintenance will be announced in advance when possible.</p>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>5. User Responsibilities</h3>
            <p>Users are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of their account credentials</li>
              <li>All activities that occur under their account</li>
              <li>Ensuring compliance with applicable laws and regulations</li>
            </ul>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>6. Limitation of Liability</h3>
            <p>Statify shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>7. Contact Information</h3>
            <p>For questions about these Terms of Service, please contact us at support@statecounter.com</p>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>
        {`
          @media (max-width: 768px) {
            .terms-container > div {
              flex-direction: column !important;
              height: auto !important;
            }
            .terms-container > div > div:first-child {
              height: 200px !important;
            }
            .terms-container > div > div:last-child {
              padding: 24px !important;
            }
          }
          
          @media (max-width: 480px) {
            .terms-container {
              padding: 10px !important;
            }
            .terms-container > div {
              border-radius: 10px !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default TermsOfService