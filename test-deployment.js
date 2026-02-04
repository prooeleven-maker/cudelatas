#!/usr/bin/env node

/**
 * Test script to verify deployment configuration
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing Deployment Configuration')
console.log('===================================\n')

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local')
let hasEnvLocal = false

try {
  fs.accessSync(envPath)
  hasEnvLocal = true
  console.log('✅ .env.local found')
} catch {
  console.log('❌ .env.local not found')
}

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  console.log('✅ package.json valid')
  console.log(`📦 Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`)
} catch (error) {
  console.log('❌ package.json invalid:', error.message)
}

// Check Next.js config
try {
  const nextConfig = require('./next.config.js')
  console.log('✅ next.config.js valid')
} catch (error) {
  console.log('❌ next.config.js invalid:', error.message)
}

// Check Vercel config
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
  console.log('✅ vercel.json valid')
  console.log(`🌍 Regions: ${vercelConfig.regions?.join(', ') || 'default'}`)
} catch (error) {
  console.log('❌ vercel.json invalid:', error.message)
}

// Check API route
const apiPath = path.join(__dirname, 'app', 'api', 'verify-key', 'route.ts')
try {
  fs.accessSync(apiPath)
  console.log('✅ API route exists')
} catch {
  console.log('❌ API route missing')
}

console.log('\n🎯 Deployment Readiness:')
if (hasEnvLocal) {
  console.log('✅ Environment configured locally')
  console.log('⚠️  Remember to configure in Vercel dashboard!')
} else {
  console.log('❌ Environment not configured')
}

console.log('\n🚀 Next Steps:')
console.log('1. Push to GitHub: git add . && git commit -m "Ready for deploy" && git push')
console.log('2. Deploy on Vercel: Import from GitHub')
console.log('3. Configure environment variables in Vercel')
console.log('4. Test: https://your-app.vercel.app/admin')