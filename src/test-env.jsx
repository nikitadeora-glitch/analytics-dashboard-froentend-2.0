// Test component to check environment variables
import React from 'react';

function TestEnv() {
  console.log('Environment variables:');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
  console.log('All env vars:', import.meta.env);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Environment Variables Test</h2>
      <p><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'undefined'}</p>
      <p><strong>VITE_GOOGLE_CLIENT_ID:</strong> {import.meta.env.VITE_GOOGLE_CLIENT_ID || 'undefined'}</p>
      <p><strong>Mode:</strong> {import.meta.env.MODE}</p>
      <p><strong>Dev:</strong> {import.meta.env.DEV ? 'true' : 'false'}</p>
    </div>
  );
}

export default TestEnv;