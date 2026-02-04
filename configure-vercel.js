#!/usr/bin/env node

/**
 * Script to help configure Vercel environment variables
 * Run this locally to get the commands needed for Vercel
 */

const fs = require('fs')
const path = require('path')


console.log('🚀 Vercel Environment Configuration Helper')
console.log('==========================================\n')

// Read .env.local
const envPath = path.join(__dirname, '.env.local')
let envContent

try {
  envContent = fs.readFileSync(envPath, 'utf8')
} catch (error) {
  console.error('❌ Could not read .env.local file')
  console.log('Make sure you have a .env.local file with your Supabase credentials\n')
  process.exit(1)
}

console.log('📄 Found .env.local with credentials')
console.log('🔧 Run these commands in your terminal to configure Vercel:\n')

const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'))

lines.forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    console.log(`vercel env add ${key}`)
    console.log(`# Enter this value: ${value}\n`)
  }
})

console.log('📋 After running the commands above:')
console.log('1. Redeploy your project: vercel --prod')
console.log('2. Or push to GitHub to trigger automatic deploy\n')

console.log('✨ Your license validation system will be ready!')