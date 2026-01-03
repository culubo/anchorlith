/* eslint-disable @typescript-eslint/no-require-imports */
// Quick script to verify Supabase connection
// Run with: node scripts/verify-supabase.js

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🔍 Checking Supabase Configuration...\n')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.log('\nPlease set in .env.local:')
  console.log('  NEXT_PUBLIC_SUPABASE_URL=...')
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=...\n')
  process.exit(1)
}

if (supabaseUrl.includes('YOUR_PROJECT') || supabaseKey.includes('your_')) {
  console.error('❌ Placeholder values detected!')
  console.log('\nPlease update .env.local with your actual Supabase credentials.\n')
  process.exit(1)
}

console.log('✅ Environment variables found')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`)

// Test connection
const https = require('https')
const url = new URL(supabaseUrl)

const options = {
  hostname: url.hostname,
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`
  }
}

console.log('\n🌐 Testing connection...')

const req = https.request(options, (res) => {
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('✅ Connection successful! Supabase is reachable.\n')
  } else {
    console.log(`⚠️  Got status ${res.statusCode} - connection works but may need configuration\n`)
  }
})

req.on('error', (error) => {
  console.error('❌ Connection failed:', error.message)
  console.log('\nPossible issues:')
  console.log('  - Project URL is incorrect')
  console.log('  - Project is paused or deleted')
  console.log('  - Network connectivity issue')
  console.log('\nPlease verify your Supabase project at: https://supabase.com/dashboard\n')
  process.exit(1)
})

req.end()

