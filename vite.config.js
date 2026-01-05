import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('http://127.0.0.1:8000/api'),
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('276575813186-e1q7equvp7nq222q5sbal2f7aaensau3.apps.googleusercontent.com')
  }
})
