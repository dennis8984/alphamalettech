import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'
import { promisify } from 'util'

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = promisify(rl.question).bind(rl)

// Platform configurations
interface PlatformConfig {
  platform: string
  requiredFields: { key: string; description: string; example?: string }[]
  optional?: { key: string; description: string; example?: string }[]
}

const platformConfigs: PlatformConfig[] = [
  {
    platform: 'facebook',
    requiredFields: [
      { key: 'page_id', description: 'Facebook Page ID', example: '123456789012345' },
      { key: 'access_token', description: 'Facebook Page Access Token (long-lived)', example: 'EAABsbCS...' }
    ],
    optional: [
      { key: 'app_id', description: 'Facebook App ID', example: '1234567890123456' },
      { key: 'app_secret', description: 'Facebook App Secret', example: 'abcdef123456...' }
    ]
  },
  {
    platform: 'twitter',
    requiredFields: [
      { key: 'api_key', description: 'Twitter API Key (Consumer Key)', example: 'xvz1evFS4wEEPTGEFPHBog' },
      { key: 'api_secret', description: 'Twitter API Secret (Consumer Secret)', example: 'L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg' },
      { key: 'access_token', description: 'Twitter Access Token', example: '1234567890-AbCdEfGhIjKlMnOpQrStUvWxYz123456' },
      { key: 'access_token_secret', description: 'Twitter Access Token Secret', example: 'AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCDEF' }
    ]
  },
  {
    platform: 'reddit',
    requiredFields: [
      { key: 'client_id', description: 'Reddit App Client ID', example: 'AbCdEfGhIjKlMn' },
      { key: 'client_secret', description: 'Reddit App Client Secret', example: 'AbCdEfGhIjKlMnOpQrStUvWxYz' },
      { key: 'refresh_token', description: 'Reddit Refresh Token (from OAuth flow)', example: '123456789-AbCdEfGhIjKlMnOpQrStUvWxYz' },
      { key: 'user_agent', description: 'Reddit User Agent', example: 'MensHealthBot/1.0 by /u/YourUsername' }
    ],
    optional: [
      { key: 'default_subreddit', description: 'Default subreddit to post to', example: 'fitness' }
    ]
  },
  {
    platform: 'instagram',
    requiredFields: [
      { key: 'instagram_business_account_id', description: 'Instagram Business Account ID', example: '17841401234567890' },
      { key: 'access_token', description: 'Instagram Access Token (via Facebook)', example: 'EAABsbCS...' }
    ]
  }
]

async function main() {
  console.log('🚀 Social Media Credentials Setup for Men\'s Health\n')
  
  // Get Supabase credentials
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || await question('Enter your Supabase URL: ')
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || await question('Enter your Supabase Service Role Key: ')
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials are required!')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl as string, supabaseKey as string)
  
  // Check connection
  const { error: testError } = await supabase.from('social_platforms').select('platform').limit(1)
  if (testError) {
    console.error('❌ Failed to connect to Supabase:', testError.message)
    console.log('\nMake sure you have run the social-marketing-schema.sql script first!')
    process.exit(1)
  }
  
  console.log('✅ Connected to Supabase\n')
  
  // Platform selection
  console.log('Available platforms:')
  platformConfigs.forEach((config, index) => {
    console.log(`${index + 1}. ${config.platform}`)
  })
  console.log(`${platformConfigs.length + 1}. Configure all platforms`)
  console.log('0. Exit')
  
  const choice = await question('\nSelect platform to configure (0-5): ')
  const choiceNum = parseInt(choice)
  
  if (choiceNum === 0) {
    console.log('👋 Goodbye!')
    rl.close()
    return
  }
  
  let platformsToConfig: PlatformConfig[] = []
  
  if (choiceNum === platformConfigs.length + 1) {
    platformsToConfig = platformConfigs
  } else if (choiceNum > 0 && choiceNum <= platformConfigs.length) {
    platformsToConfig = [platformConfigs[choiceNum - 1]]
  } else {
    console.error('❌ Invalid choice!')
    rl.close()
    return
  }
  
  // Configure each selected platform
  for (const config of platformsToConfig) {
    console.log(`\n📱 Configuring ${config.platform.toUpperCase()}...`)
    console.log('━'.repeat(50))
    
    const credentials: any = {}
    
    // Get required fields
    for (const field of config.requiredFields) {
      let value = ''
      while (!value) {
        const prompt = field.example 
          ? `${field.description} (e.g., ${field.example}): `
          : `${field.description}: `
        value = await question(prompt) as string
        
        if (!value) {
          console.log('⚠️  This field is required!')
        }
      }
      credentials[field.key] = value.trim()
    }
    
    // Get optional fields
    if (config.optional) {
      console.log('\nOptional fields (press Enter to skip):')
      for (const field of config.optional) {
        const prompt = field.example 
          ? `${field.description} (e.g., ${field.example}): `
          : `${field.description}: `
        const value = await question(prompt) as string
        if (value) {
          credentials[field.key] = value.trim()
        }
      }
    }
    
    // Save to database
    const { error } = await supabase
      .from('social_platforms')
      .update({ 
        credentials,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('platform', config.platform)
    
    if (error) {
      console.error(`❌ Failed to save ${config.platform} credentials:`, error.message)
    } else {
      console.log(`✅ ${config.platform} credentials saved successfully!`)
    }
  }
  
  // Show summary
  console.log('\n📊 Configuration Summary:')
  console.log('━'.repeat(50))
  
  const { data: platforms } = await supabase
    .from('social_platforms')
    .select('platform, is_active, credentials')
  
  if (platforms) {
    platforms.forEach(p => {
      const status = p.is_active && p.credentials ? '✅' : '❌'
      const credStatus = p.credentials ? 'Configured' : 'Not configured'
      console.log(`${status} ${p.platform}: ${credStatus}`)
    })
  }
  
  console.log('\n🎉 Setup complete!')
  console.log('\nNext steps:')
  console.log('1. Test your configuration at: https://www.menshb.com/admin/social-marketing')
  console.log('2. Set up posting schedules')
  console.log('3. Configure automation rules')
  console.log('4. Start the article detector to begin automated posting')
  
  rl.close()
}

// Run the setup
main().catch(console.error)