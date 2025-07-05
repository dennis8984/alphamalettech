import { createClient } from '@supabase/supabase-js'

/**
 * Manually save Reddit credentials
 * Run with: npx tsx scripts/manual-save-reddit-credentials.ts
 */

// FILL IN YOUR CREDENTIALS HERE
const REDDIT_CREDENTIALS = {
  client_id: 'YOUR_CLIENT_ID',
  client_secret: 'YOUR_CLIENT_SECRET',
  refresh_token: 'YOUR_REFRESH_TOKEN',
  user_agent: 'MensHealthBot/1.0 by /u/YourUsername'
}

async function saveRedditCredentials() {
  console.log('🔧 Manually saving Reddit credentials...\n')
  
  // Check if credentials are filled
  if (REDDIT_CREDENTIALS.client_id === 'YOUR_CLIENT_ID') {
    console.error('❌ Please fill in your Reddit credentials in this script first!')
    console.log('\nEdit this file and replace:')
    console.log('  - YOUR_CLIENT_ID with your actual client ID')
    console.log('  - YOUR_CLIENT_SECRET with your actual client secret')
    console.log('  - YOUR_REFRESH_TOKEN with your actual refresh token')
    console.log('  - Update the user_agent with your Reddit username')
    process.exit(1)
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    console.log('Please ensure you have:')
    console.log('  - NEXT_PUBLIC_SUPABASE_URL')
    console.log('  - SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  try {
    // First check if reddit platform exists
    const { data: existing } = await supabase
      .from('social_platforms')
      .select('*')
      .eq('platform', 'reddit')
      .single()
    
    if (existing) {
      // Update existing
      console.log('📝 Updating existing Reddit platform...')
      const { data, error } = await supabase
        .from('social_platforms')
        .update({
          credentials: REDDIT_CREDENTIALS,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('platform', 'reddit')
        .select()
        .single()
      
      if (error) {
        console.error('❌ Update failed:', error)
        process.exit(1)
      }
      
      console.log('✅ Reddit credentials updated successfully!')
      console.log('\nPlatform status:')
      console.log(`  - Platform: ${data.platform}`)
      console.log(`  - Active: ${data.is_active}`)
      console.log(`  - Has credentials: Yes`)
      console.log(`  - Updated: ${data.updated_at}`)
    } else {
      // Insert new
      console.log('📝 Creating new Reddit platform entry...')
      const { data, error } = await supabase
        .from('social_platforms')
        .insert({
          platform: 'reddit',
          credentials: REDDIT_CREDENTIALS,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Insert failed:', error)
        
        // If it's a unique constraint error, the table might need the row
        if (error.code === '23505') {
          console.log('\n💡 Try running this SQL in Supabase first:')
          console.log("INSERT INTO social_platforms (platform, is_active, credentials) VALUES ('reddit', false, '{}') ON CONFLICT (platform) DO NOTHING;")
        }
        process.exit(1)
      }
      
      console.log('✅ Reddit platform created and credentials saved!')
      console.log('\nPlatform status:')
      console.log(`  - Platform: ${data.platform}`)
      console.log(`  - Active: ${data.is_active}`)
      console.log(`  - Has credentials: Yes`)
      console.log(`  - Created: ${data.created_at}`)
    }
    
    console.log('\n🎉 Success! You can now:')
    console.log('  1. Go to https://www.menshb.com/admin/social-marketing')
    console.log('  2. Click on the "Test" tab')
    console.log('  3. Test your Reddit connection')
    console.log('  4. Start posting to Reddit!')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the script
saveRedditCredentials()