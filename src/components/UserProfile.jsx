import React from 'react'
import { useAuth } from '../App'

const UserProfile = () => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <div>Please login to view your profile</div>
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>User Profile</h2>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>Personal Information</h3>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Name:</strong> {user.full_name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Company:</strong> {user.company_name || 'Not specified'}</p>
        <p><strong>Verified:</strong> {user.is_verified ? 'Yes' : 'No'}</p>
        <p><strong>Account Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</p>
        <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        
        {/* Google specific fields */}
        {user.google_id && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '5px' }}>
            <h4>Google Account</h4>
            <p><strong>Google ID:</strong> {user.google_id}</p>
            {user.avatar && (
              <div>
                <strong>Profile Picture:</strong>
                <br />
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  style={{ width: '50px', height: '50px', borderRadius: '50%', marginTop: '10px' }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '15px', 
        borderRadius: '8px',
        border: '1px solid #ffeaa7'
      }}>
        <h4>🎯 Context API Usage Example</h4>
        <p>This user information is now available throughout your app via the AuthContext!</p>
        <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', fontSize: '12px' }}>
{`const { user, isAuthenticated } = useAuth()

// Access user data anywhere in your app:
console.log(user.full_name)        // User's full name
console.log(user.email)            // User's email
console.log(user.company_name)     // User's company
console.log(user.is_verified)      // Verification status
console.log(user.created_at)       // Account creation date`}
        </pre>
      </div>
    </div>
  )
}

export default UserProfile
