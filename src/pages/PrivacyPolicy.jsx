import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logo from '/favicon.png'
import backgroundImage from '../assets/analytic.png'

function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="privacy-container" style={{
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
              Privacy Policy
            </h2>
            <p style={{
              fontSize: '18px',
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
            }}>
              Your privacy is our priority
            </p>
          </div>
        </div>

        {/* Right side - Privacy Content */}
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
              Privacy Policy
            </h1>
          </div>

          {/* Privacy Content */}
          <div style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#374151'
          }}>
            <p><strong>Last updated:</strong> December 2025</p>

            <h3 style={{ color: '#302b63', marginTop: '24px' }}>1. Information We Collect</h3>
            <p>Statify collects the following types of information:</p>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, company name</li>
              <li><strong>Website Analytics Data:</strong> Page views, visitor counts, traffic sources</li>
              <li><strong>Technical Information:</strong> IP addresses, browser types, device information</li>
              <li><strong>Usage Data:</strong> How you interact with our service</li>
            </ul>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>2. How We Use Your Information</h3>
            <p>We use the collected information to:</p>
            <ul>
              <li>Provide and maintain our analytics service</li>
              <li>Generate website performance reports</li>
              <li>Improve our service and user experience</li>
              <li>Communicate with you about your account</li>
              <li>Ensure security and prevent fraud</li>
            </ul>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>3. Data Sharing and Disclosure</h3>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share information only in these circumstances:</p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>In connection with a business transfer</li>
            </ul>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>4. Data Security</h3>
            <p>We implement appropriate security measures to protect your information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.</p>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>5. Data Retention</h3>
            <p>We retain your information for as long as necessary to provide our services and comply with legal obligations. Analytics data is typically retained for 2 years unless you request deletion.</p>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>6. Your Rights</h3>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h3 style={{ color: '#302b63', marginTop: '20px' }}>7. Contact Us</h3>
            <p>For privacy-related questions or requests, contact us at privacy@statecounter.com</p>
          </div>
        </div>
      </div>

      {/* Responsive Styles */}
      <style>
        {`
          @media (max-width: 1024px) {
            .privacy-container > div {
              flex-direction: column !important;
              height: auto !important;
              max-width: 500px !important;
              margin: 20px auto !important;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
            }
            /* Branding Section */
            .privacy-container > div > div:first-child {
              flex: none !important;
              height: 180px !important;
              position: relative !important;
            }
            .privacy-container > div > div:first-child h2 {
              font-size: 24px !important;
              margin-bottom: 4px !important;
            }
            .privacy-container > div > div:first-child p {
              font-size: 13px !important;
            }
            /* Content Section */
            .privacy-container > div > div:last-child {
              flex: none !important;
              padding: 24px 20px !important;
              max-height: 500px !important;
            }
          }
          
          @media (max-width: 480px) {
            .privacy-container {
              padding: 15px !important;
            }
            .privacy-container > div > div:first-child {
              height: 150px !important;
            }
            .privacy-container > div > div:first-child h2 {
              font-size: 20px !important;
            }
            .privacy-container > div > div:first-child p {
              font-size: 11px !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default PrivacyPolicy