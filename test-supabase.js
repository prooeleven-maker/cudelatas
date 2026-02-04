const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('Key:', supabaseKey ? 'Set (length: ' + supabaseKey.length + ')' : 'Not set')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables not set properly')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🔍 Testing connection...')

    // Test basic connection
    const { data, error } = await supabase.from('license_keys').select('count').limit(1)

    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }

    console.log('✅ Connection successful!')
    console.log('Database accessible:', data ? 'Yes' : 'No')

    return true
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    return false
  }
}

testConnection()