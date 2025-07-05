import { createClient } from '@supabase/supabase-js'
import { socialAPIManager } from '../lib/social-apis'

/**
 * Tests social media credentials by attempting to validate each platform
 * Run with: npx tsx scripts/test-social-credentials.ts
 */

async function testCredentials() {
  console.log('🧪 Testing Social Media Credentials...\n')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Get all platforms
  const { data: platforms } = await supabase
    .from('social_platforms')
    .select('*')
    .eq('is_active', true)
  
  if (!platforms || platforms.length === 0) {
    console.log('❌ No active platforms found')
    return
  }
  
  console.log(`Found ${platforms.length} active platforms to test:\n`)
  
  // Test each platform
  for (const platform of platforms) {
    console.log(`Testing ${platform.platform}...`)
    
    if (!platform.credentials || Object.keys(platform.credentials).length === 0) {
      console.log(`❌ ${platform.platform}: No credentials configured\n`)
      continue
    }
    
    try {
      // Initialize platform
      const initialized = await socialAPIManager.initializePlatform(platform.platform)
      
      if (initialized) {
        console.log(`✅ ${platform.platform}: Credentials validated successfully`)
        
        // Get rate limit info
        try {
          const rateLimits = await socialAPIManager.getAllRateLimits()
          const platformLimit = rateLimits[platform.platform]
          if (platformLimit && !platformLimit.error) {
            console.log(`   Rate limit: ${platformLimit.remaining} requests remaining`)
            console.log(`   Resets at: ${platformLimit.reset}`)
          }
        } catch (e) {
          // Rate limit check failed, but credentials are valid
        }
      } else {
        console.log(`❌ ${platform.platform}: Failed to validate credentials`)
      }
    } catch (error) {
      console.log(`❌ ${platform.platform}: Error - ${error}`)
    }
    
    console.log() // Empty line between platforms
  }
  
  // Test posting capability (dry run)
  console.log('🧪 Testing posting capability (dry run)...\n')
  
  const testPost = {
    platform: 'test',
    content: 'This is a test post from Men\'s Health automated system',
    link: 'https://www.menshb.com',
    hashtags: ['menshealth', 'fitness', 'test']
  }
  
  for (const platform of platforms) {
    if (!platform.credentials || Object.keys(platform.credentials).length === 0) {
      continue
    }
    
    console.log(`Would post to ${platform.platform}:`)
    console.log(`   Content: "${testPost.content.substring(0, 50)}..."`)
    console.log(`   Link: ${testPost.link}`)
    console.log(`   Hashtags: ${testPost.hashtags.join(', ')}`)
    console.log()
  }
  
  console.log('✅ Credential test complete!')
  console.log('\nNext steps:')
  console.log('1. Fix any platforms showing errors')
  console.log('2. Set up posting schedules in the admin panel')
  console.log('3. Configure automation rules')
  console.log('4. Start the article detector for automated posting')
}

// Run the test
testCredentials().catch(console.error)