const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Auth Connection')
console.log('=====================================\n')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables not configured')
  console.log('Check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAuth() {
  try {
    console.log('📧 Checking for existing users...')

    // Try to get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.log('⚠️  No active session (this is normal)')
    } else if (sessionData.session) {
      console.log('✅ Active session found')
      console.log('User:', sessionData.session.user.email)
    } else {
      console.log('ℹ️  No active session')
    }

    // Check if we can list users (this requires service role key)
    console.log('\n👥 To create an admin user, you need to:')
    console.log('1. Go to Supabase Dashboard')
    console.log('2. Go to Authentication > Users')
    console.log('3. Click "Add user"')
    console.log('4. Enter email and password')
    console.log('5. Check "Auto confirm user"')
    console.log('6. Click "Add user"')

    console.log('\n🔐 Use these credentials to login:')
    console.log('- URL: http://localhost:3000/auth/login')
    console.log('- Email: [the email you created in Supabase]')
    console.log('- Password: [the password you set]')

    console.log('\n🚀 Start the dev server:')
    console.log('npm run dev')

  } catch (error) {
    console.error('❌ Auth test failed:', error.message)
  }
}

testAuth()