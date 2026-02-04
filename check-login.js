#!/usr/bin/env node

/**
 * Simple login test script
 */

console.log('🔐 Login Troubleshooting Guide')
console.log('==============================\n')

console.log('📋 Steps to fix login issues:')
console.log('')

console.log('1️⃣  Check if user exists in Supabase:')
console.log('   - Go to: https://supabase.com/dashboard/project/hdcnlpxusmvfmtqhseoo/auth/users')
console.log('   - Make sure you have created a user with email/password')
console.log('   - The user must be "Confirmed" (not pending)')
console.log('')

console.log('2️⃣  Check environment variables:')
console.log('   - Open .env.local file')
console.log('   - Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
console.log('   - Values should match your Supabase project')
console.log('')

console.log('3️⃣  Test the application:')
console.log('   - Run: npm run dev')
console.log('   - Open: http://localhost:3000/auth/login')
console.log('   - Try to login with your Supabase credentials')
console.log('')

console.log('4️⃣  Check browser console:')
console.log('   - Press F12 → Console tab')
console.log('   - Look for any JavaScript errors')
console.log('   - Check network tab for failed requests')
console.log('')

console.log('5️⃣  Common issues:')
console.log('   ❌ Wrong email/password')
console.log('   ❌ User not confirmed in Supabase')
console.log('   ❌ Environment variables incorrect')
console.log('   ❌ Supabase project paused/inactive')
console.log('')

console.log('🔧 Quick fixes:')
console.log('   - Delete and recreate the user in Supabase')
console.log('   - Double-check the .env.local values')
console.log('   - Make sure npm run dev is running')
console.log('')

console.log('📞 Need help? Share:')
console.log('   - The error message you see')
console.log('   - Your Supabase project URL')
console.log('   - Whether the user exists and is confirmed')