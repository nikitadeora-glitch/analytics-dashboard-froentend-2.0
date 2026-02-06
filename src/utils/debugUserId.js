// Test script to verify AI Insights API userId issue
import { useAuth } from '../App'

// Test function to check userId availability
export const testUserIdAvailability = () => {
  console.log('🧪 Testing User ID Availability for AI Insights...')
  
  // Test 1: Check if AuthContext has user data
  console.log('\n1️⃣ Testing AuthContext User Data:')
  
  // This would be tested in actual React component
  console.log(`
// In Dashboard.jsx:
const { user } = useAuth()
const userId = user?.id || 5

console.log('User from AuthContext:', user)
console.log('User ID:', userId)
console.log('Type of User ID:', typeof userId)
  `)
  
  // Test 2: Check API call structure
  console.log('\n2️⃣ Testing API Call Structure:')
  console.log(`
// AI Insights API expects:
{
  "question": "give me reports data last 30 days from prpwebs.in",
  "user_id": 123  // This should be a number
}

// Common issues:
- user_id is undefined/null
- user_id is string instead of number
- user_id is missing from request body
  `)
  
  // Test 3: Verify request body
  console.log('\n3️⃣ Request Body Verification:')
  console.log(`
// Before sending request:
const requestBody = {
  question: question,
  user_id: userId
}

console.log('Request Body:', requestBody)
// Should show: { question: "...", user_id: 123 }

// If user_id is undefined, check:
// 1. Is user logged in?
// 2. Does AuthContext have user data?
// 3. Is user.id available?
  `)
  
  return true
}

// Function to debug userId issues
export const debugUserId = (userId) => {
  console.log('\n🔍 Debugging User ID:')
  console.log('User ID Value:', userId)
  console.log('Type:', typeof userId)
  console.log('Is Null:', userId === null)
  console.log('Is Undefined:', userId === undefined)
  console.log('Is Number:', typeof userId === 'number')
  console.log('Is String:', typeof userId === 'string')
  
  if (userId === undefined || userId === null) {
    console.log('\n❌ PROBLEM: User ID is missing!')
    console.log('Solutions:')
    console.log('1. Check if user is logged in')
    console.log('2. Check AuthContext user data')
    console.log('3. Check useAuth() hook usage')
    return false
  }
  
  if (typeof userId === 'string') {
    console.log('\n⚠️  WARNING: User ID is string, backend expects number')
    console.log('Solution: Convert to number - parseInt(userId) or Number(userId)')
  }
  
  console.log('\n✅ User ID looks good!')
  return true
}

// Test the actual API call structure
export const testApiCallStructure = (question, userId) => {
  console.log('\n🌐 Testing API Call Structure:')
  
  const requestBody = {
    question: question,
    user_id: userId
  }
  
  console.log('Request Body:', JSON.stringify(requestBody, null, 2))
  
  // Check for common issues
  const issues = []
  
  if (!requestBody.question) {
    issues.push('Question is missing')
  }
  
  if (!requestBody.user_id && requestBody.user_id !== 0) {
    issues.push('User ID is missing or null')
  }
  
  if (typeof requestBody.user_id === 'string') {
    issues.push('User ID should be number, not string')
  }
  
  if (issues.length > 0) {
    console.log('\n❌ Issues Found:')
    issues.forEach(issue => console.log('- ' + issue))
    return false
  }
  
  console.log('\n✅ API Call Structure is correct!')
  return true
}

// Run tests in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Development Mode - Running User ID Tests')
  testUserIdAvailability()
}
