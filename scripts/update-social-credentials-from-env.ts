import { createClient } from '@supabase/supabase-js'

/**
 * Updates social media credentials in Supabase from environment variables
 * Run with: npx tsx scripts/update-social-credentials-from-env.ts
 */

async function updateCredentialsFromEnv() {
  console.log('🔄 Updating social media credentials from environment variables...\n')
  
  // Check Supabase connection
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Platform credential mappings
  const updates = [
    {
      platform: 'facebook',
      credentials: {
        page_id: process.env.FACEBOOK_PAGE_ID,
        access_token: process.env.FACEBOOK_ACCESS_TOKEN,
        app_id: process.env.FACEBOOK_APP_ID,
        app_secret: process.env.FACEBOOK_APP_SECRET
      }
    },
    {
      platform: 'twitter',
      credentials: {
        api_key: process.env.TWITTER_API_KEY || process.env.X_API_KEY,
        api_secret: process.env.TWITTER_API_SECRET || process.env.X_API_SECRET,
        access_token: process.env.TWITTER_ACCESS_TOKEN || process.env.X_ACCESS_TOKEN,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || process.env.X_ACCESS_SECRET
      }
    },
    {
      platform: 'reddit',
      credentials: {
        client_id: process.env.REDDIT_CLIENT_ID,
        client_secret: process.env.REDDIT_CLIENT_SECRET,
        refresh_token: process.env.REDDIT_REFRESH_TOKEN,
        user_agent: process.env.REDDIT_USER_AGENT || 'MensHealthBot/1.0'
      }
    },
    {
      platform: 'instagram',
      credentials: {
        instagram_business_account_id: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || process.env.INSTAGRAM_ACCOUNT_ID,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN
      }
    }
  ]
  
  // Update each platform
  for (const update of updates) {
    // Check if any credentials are provided for this platform
    const hasCredentials = Object.values(update.credentials).some(v => v !== undefined)
    
    if (!hasCredentials) {
      console.log(`⏭️  Skipping ${update.platform} - no credentials in environment`)
      continue
    }
    
    // Filter out undefined values
    const credentials = Object.fromEntries(
      Object.entries(update.credentials).filter(([_, v]) => v !== undefined)
    )
    
    // Update in database
    const { error } = await supabase
      .from('social_platforms')
      .update({
        credentials,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('platform', update.platform)
    
    if (error) {
      console.error(`❌ Failed to update ${update.platform}:`, error.message)
    } else {
      console.log(`✅ Updated ${update.platform} credentials`)
      
      // Show what was updated
      const updatedFields = Object.keys(credentials)
      console.log(`   Fields: ${updatedFields.join(', ')}`)
    }
  }
  
  // Show final status
  console.log('\n📊 Final Status:')
  const { data: platforms } = await supabase
    .from('social_platforms')
    .select('platform, is_active, credentials')
  
  if (platforms) {
    platforms.forEach(p => {
      const hasConfig = p.credentials && Object.keys(p.credentials).length > 0
      const status = p.is_active && hasConfig ? '✅' : '❌'
      console.log(`${status} ${p.platform}: ${hasConfig ? 'Configured' : 'Not configured'}`)
    })
  }
  
  console.log('\n✅ Update complete!')
}

// Run the update
updateCredentialsFromEnv().catch(console.error)