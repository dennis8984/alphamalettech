'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff, TestTube, Settings, Book, Copy } from 'lucide-react'

interface PlatformCredentials {
  platform: string
  credentials: any
  is_active: boolean
}

interface CredentialField {
  key: string
  label: string
  type: 'text' | 'password' | 'textarea'
  placeholder?: string
  helpText?: string
  required?: boolean
  validation?: (value: string) => string | null
}

interface PlatformConfig {
  platform: string
  name: string
  icon: string
  color: string
  fields: CredentialField[]
  setupGuide: string
  testEndpoint?: string
}

const platformConfigs: PlatformConfig[] = [
  {
    platform: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600',
    fields: [
      {
        key: 'page_id',
        label: 'Page ID',
        type: 'text',
        placeholder: '123456789012345',
        helpText: 'Found in your Facebook Page settings under "About"',
        required: true,
        validation: (value) => {
          if (!/^\d+$/.test(value)) return 'Page ID must be numeric'
          return null
        }
      },
      {
        key: 'access_token',
        label: 'Page Access Token',
        type: 'password',
        placeholder: 'EAABsbCS...',
        helpText: 'Long-lived token from Graph API Explorer',
        required: true
      },
      {
        key: 'app_id',
        label: 'App ID (Optional)',
        type: 'text',
        placeholder: '1234567890123456',
        helpText: 'Your Facebook App ID for advanced features'
      },
      {
        key: 'app_secret',
        label: 'App Secret (Optional)',
        type: 'password',
        placeholder: 'abcdef123456...',
        helpText: 'Your Facebook App Secret'
      }
    ],
    setupGuide: `
# Facebook Setup Guide

1. **Create a Facebook App**
   - Go to [developers.facebook.com](https://developers.facebook.com)
   - Click "My Apps" → "Create App"
   - Choose "Business" type

2. **Get Your Page ID**
   - Go to your Facebook Page
   - Click "About" → Find "Page ID"

3. **Generate Access Token**
   - Use Graph API Explorer
   - Grant permissions: pages_show_list, pages_manage_posts
   - Exchange for long-lived token
    `
  },
  {
    platform: 'twitter',
    name: 'X (Twitter)',
    icon: '🐦',
    color: 'bg-black',
    fields: [
      {
        key: 'api_key',
        label: 'API Key (Consumer Key)',
        type: 'text',
        placeholder: 'xvz1evFS4wEEPTGEFPHBog',
        required: true
      },
      {
        key: 'api_secret',
        label: 'API Secret (Consumer Secret)',
        type: 'password',
        placeholder: 'L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg',
        required: true
      },
      {
        key: 'access_token',
        label: 'Access Token',
        type: 'password',
        placeholder: '1234567890-AbCdEfGhIjKlMnOpQrStUvWxYz',
        required: true
      },
      {
        key: 'access_token_secret',
        label: 'Access Token Secret',
        type: 'password',
        placeholder: 'AbCdEfGhIjKlMnOpQrStUvWxYz1234567890',
        required: true
      }
    ],
    setupGuide: `
# X (Twitter) Setup Guide

1. **Apply for API Access**
   - Go to [developer.twitter.com](https://developer.twitter.com)
   - Apply for "Elevated" access

2. **Create an App**
   - Create new App in Developer Portal
   - Set permissions to "Read and Write"

3. **Get Credentials**
   - Find API Key & Secret in app settings
   - Generate Access Token & Secret
    `
  },
  {
    platform: 'reddit',
    name: 'Reddit',
    icon: '🤖',
    color: 'bg-orange-600',
    fields: [
      {
        key: 'client_id',
        label: 'Client ID',
        type: 'text',
        placeholder: 'AbCdEfGhIjKlMn',
        helpText: 'Found under "personal use script"',
        required: true
      },
      {
        key: 'client_secret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'AbCdEfGhIjKlMnOpQrStUvWxYz',
        required: true
      },
      {
        key: 'refresh_token',
        label: 'Refresh Token',
        type: 'password',
        placeholder: '123456789-AbCdEfGhIjKlMnOpQrStUvWxYz',
        helpText: 'Generated via OAuth flow',
        required: true
      },
      {
        key: 'user_agent',
        label: 'User Agent',
        type: 'text',
        placeholder: 'MensHealthBot/1.0 by /u/YourUsername',
        helpText: 'Format: AppName/Version by /u/username',
        required: true,
        validation: (value) => {
          if (!value.includes('by /u/')) return 'Must include "by /u/username"'
          return null
        }
      },
      {
        key: 'default_subreddit',
        label: 'Default Subreddit (Optional)',
        type: 'text',
        placeholder: 'fitness',
        helpText: 'Default subreddit for posts'
      }
    ],
    setupGuide: `
# Reddit Setup Guide

1. **Create Reddit App**
   - Go to [reddit.com/prefs/apps](https://reddit.com/prefs/apps)
   - Click "Create App"
   - Choose "script" type
   - Set redirect URI: http://localhost:8080

2. **Get Refresh Token**
   - Use our OAuth helper below
   - Or run the Python script in docs
    `
  },
  {
    platform: 'instagram',
    name: 'Instagram',
    icon: '📸',
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
    fields: [
      {
        key: 'instagram_business_account_id',
        label: 'Business Account ID',
        type: 'text',
        placeholder: '17841401234567890',
        helpText: 'Get from Facebook Graph API',
        required: true,
        validation: (value) => {
          if (!/^\d+$/.test(value)) return 'Account ID must be numeric'
          return null
        }
      },
      {
        key: 'access_token',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Same as Facebook token',
        helpText: 'Use your Facebook Page Access Token',
        required: true
      }
    ],
    setupGuide: `
# Instagram Setup Guide

1. **Convert to Business Account**
   - Settings → Account → Switch to Professional
   - Choose "Business"

2. **Connect to Facebook Page**
   - Settings → Linked Accounts
   - Connect your Facebook Page

3. **Get Business Account ID**
   - Use Graph API Explorer
   - Query: GET /me/accounts
   - Then: GET /{page-id}?fields=instagram_business_account
    `
  }
]

export default function SocialMediaSetupWizard() {
  const [currentPlatform, setCurrentPlatform] = useState<string>('facebook')
  const [credentials, setCredentials] = useState<Record<string, PlatformCredentials>>({})
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState<'setup' | 'guide' | 'test'>('setup')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load existing credentials
  useEffect(() => {
    loadCredentials()
  }, [])

  const loadCredentials = async () => {
    try {
      const response = await fetch('/api/admin/social-marketing/credentials')
      const data = await response.json()
      
      if (data.platforms) {
        const creds: Record<string, PlatformCredentials> = {}
        data.platforms.forEach((p: any) => {
          creds[p.platform] = p
        })
        setCredentials(creds)
        
        // Load form data for current platform
        if (creds[currentPlatform]?.credentials) {
          setFormData(creds[currentPlatform].credentials)
        }
      }
    } catch (error) {
      console.error('Error loading credentials:', error)
    }
  }

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const config = platformConfigs.find(p => p.platform === currentPlatform)
    if (!config) return false

    const newErrors: Record<string, string> = {}
    
    for (const field of config.fields) {
      const value = formData[field.key]
      
      // Check required fields
      if (field.required && !value) {
        newErrors[field.key] = `${field.label} is required`
      }
      
      // Run custom validation
      if (value && field.validation) {
        const error = field.validation(value)
        if (error) {
          newErrors[field.key] = error
        }
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveCredentials = async () => {
    if (!validateForm()) return

    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/social-marketing/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: currentPlatform,
          credentials: formData,
          is_active: true
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        await loadCredentials()
        alert('Credentials saved successfully!')
      } else {
        alert(`Error saving credentials: ${result.error || 'Unknown error'}`)
      }
    } catch (error: any) {
      alert(`Error saving credentials: ${error.message}`)
    }
    
    setLoading(false)
  }

  const testPlatform = async (platform: string) => {
    setTesting(platform)
    
    try {
      const response = await fetch('/api/admin/social-marketing/test-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      })
      
      const result = await response.json()
      setTestResults(prev => ({ ...prev, [platform]: result }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [platform]: { success: false, error: 'Test failed' } 
      }))
    }
    
    setTesting(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const currentConfig = platformConfigs.find(p => p.platform === currentPlatform)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Social Media Setup Wizard</h2>
      
      {/* Platform Selector */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {platformConfigs.map(config => {
          const creds = credentials[config.platform]
          const isConfigured = creds?.credentials && Object.keys(creds.credentials).length > 0
          const isActive = creds?.is_active
          
          return (
            <button
              key={config.platform}
              onClick={() => {
                setCurrentPlatform(config.platform)
                setFormData(creds?.credentials || {})
                setErrors({})
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                currentPlatform === config.platform
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{config.icon}</span>
              <div className="text-left">
                <div className="font-semibold">{config.name}</div>
                <div className="text-xs">
                  {isConfigured ? (
                    <span className={`flex items-center ${isActive ? 'text-green-600' : 'text-yellow-600'}`}>
                      {isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                      {isActive ? 'Active' : 'Configured'}
                    </span>
                  ) : (
                    <span className="text-gray-500">Not configured</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {currentConfig && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('setup')}
              className={`pb-2 px-1 ${
                activeTab === 'setup'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Setup
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-2 px-1 ${
                activeTab === 'guide'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <Book className="w-4 h-4 inline mr-2" />
              Guide
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`pb-2 px-1 ${
                activeTab === 'test'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              <TestTube className="w-4 h-4 inline mr-2" />
              Test
            </button>
          </div>

          {/* Setup Tab */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <span className="text-2xl mr-2">{currentConfig.icon}</span>
                Configure {currentConfig.name}
              </h3>
              
              {currentConfig.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  <div className="relative">
                    {field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors[field.key] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        rows={3}
                      />
                    ) : (
                      <input
                        type={
                          field.type === 'password' && !showPasswords[field.key]
                            ? 'password'
                            : 'text'
                        }
                        value={formData[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          errors[field.key] ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    )}
                    
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({
                          ...prev,
                          [field.key]: !prev[field.key]
                        }))}
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords[field.key] ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>
                  
                  {field.helpText && (
                    <p className="mt-1 text-sm text-gray-500">{field.helpText}</p>
                  )}
                  
                  {errors[field.key] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field.key]}</p>
                  )}
                </div>
              ))}
              
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={saveCredentials}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Credentials'}
                </button>
                
                <button
                  onClick={() => {
                    setFormData({})
                    setErrors({})
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Guide Tab */}
          {activeTab === 'guide' && (
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Quick Links</h4>
                <div className="space-y-1 text-sm">
                  {currentConfig.platform === 'facebook' && (
                    <>
                      <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        → Facebook Developers
                      </a>
                      <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        → Graph API Explorer
                      </a>
                    </>
                  )}
                  {currentConfig.platform === 'twitter' && (
                    <>
                      <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        → Twitter Developer Portal
                      </a>
                    </>
                  )}
                  {currentConfig.platform === 'reddit' && (
                    <>
                      <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        → Reddit Apps
                      </a>
                      <a href="https://github.com/reddit-archive/reddit/wiki/OAuth2" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        → Reddit OAuth2 Guide
                      </a>
                    </>
                  )}
                  {currentConfig.platform === 'instagram' && (
                    <>
                      <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        → Facebook Business
                      </a>
                      <a href="https://developers.facebook.com/docs/instagram-api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block">
                        → Instagram API Docs
                      </a>
                    </>
                  )}
                </div>
              </div>
              
              <div className="whitespace-pre-wrap text-sm">
                {currentConfig.setupGuide}
              </div>
              
              {currentConfig.platform === 'reddit' && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Reddit OAuth Helper</h4>
                  <p className="text-sm mb-3">Use this Python script to get your refresh token:</p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-xs">
{`import requests
from requests.auth import HTTPBasicAuth

# Your app credentials
client_id = '${formData.client_id || 'YOUR_CLIENT_ID'}'
client_secret = '${formData.client_secret || 'YOUR_CLIENT_SECRET'}'
username = 'YOUR_REDDIT_USERNAME'
password = 'YOUR_REDDIT_PASSWORD'

# Get refresh token
auth = HTTPBasicAuth(client_id, client_secret)
data = {
    'grant_type': 'password',
    'username': username,
    'password': password
}
headers = {'User-Agent': '${formData.user_agent || 'MensHealthBot/1.0'}'}

response = requests.post(
    'https://www.reddit.com/api/v1/access_token',
    auth=auth,
    data=data,
    headers=headers
)

print(response.json())  # Look for 'refresh_token'`}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(
                        `import requests\nfrom requests.auth import HTTPBasicAuth\n\n# Your app credentials\nclient_id = '${formData.client_id || 'YOUR_CLIENT_ID'}'\nclient_secret = '${formData.client_secret || 'YOUR_CLIENT_SECRET'}'\nusername = 'YOUR_REDDIT_USERNAME'\npassword = 'YOUR_REDDIT_PASSWORD'\n\n# Get refresh token\nauth = HTTPBasicAuth(client_id, client_secret)\ndata = {\n    'grant_type': 'password',\n    'username': username,\n    'password': password\n}\nheaders = {'User-Agent': '${formData.user_agent || 'MensHealthBot/1.0'}'}\n\nresponse = requests.post(\n    'https://www.reddit.com/api/v1/access_token',\n    auth=auth,\n    data=data,\n    headers=headers\n)\n\nprint(response.json())  # Look for 'refresh_token'`
                      )}
                      className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Test Tab */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Credentials</h3>
              
              <div className="space-y-3">
                {platformConfigs.map(config => {
                  const creds = credentials[config.platform]
                  const isConfigured = creds?.credentials && Object.keys(creds.credentials).length > 0
                  const testResult = testResults[config.platform]
                  
                  return (
                    <div
                      key={config.platform}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{config.icon}</span>
                        <div>
                          <div className="font-medium">{config.name}</div>
                          <div className="text-sm text-gray-500">
                            {isConfigured ? 'Configured' : 'Not configured'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {testResult && (
                          <div className="flex items-center space-x-2">
                            {testResult.success ? (
                              <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-green-600">Valid</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-red-500" />
                                <span className="text-sm text-red-600">
                                  {testResult.error || 'Invalid'}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                        
                        <button
                          onClick={() => testPlatform(config.platform)}
                          disabled={!isConfigured || testing === config.platform}
                          className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                        >
                          {testing === config.platform ? 'Testing...' : 'Test'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Test Post Preview</h4>
                <p className="text-sm text-gray-600 mb-3">
                  This is how your posts will appear on each platform:
                </p>
                
                <div className="bg-white p-4 rounded border">
                  <p className="font-medium mb-2">Sample Post:</p>
                  <p className="text-gray-700 mb-2">
                    "💪 Transform your fitness journey with our latest guide to building muscle naturally. 
                    Science-backed tips that actually work!"
                  </p>
                  <a href="#" className="text-blue-600 hover:underline">
                    www.menshb.com/articles/muscle-building-guide
                  </a>
                  <p className="text-gray-500 text-sm mt-2">
                    #menshealth #fitness #musclebuilding #workout
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}