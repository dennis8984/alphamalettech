import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface Article {
  id: string
  title: string
  content: string
  featured_image: string | null
  slug: string
}

// Function to properly convert markdown to HTML
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown
  
  // First, remove any existing HTML tags that might have been double-processed
  html = html.replace(/<h[2-4][^>]*>/g, '')
  html = html.replace(/<\/h[2-4]>/g, '')
  
  // Convert headers (#### = h2, ### = h3, ## = h4)
  html = html.replace(/^####\s+(.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">$1</h2>')
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-10 mb-4">$1</h3>')
  html = html.replace(/^##\s+(.+)$/gm, '<h4 class="text-lg font-bold text-gray-900 mt-8 mb-3">$1</h4>')
  
  // Convert bold text
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // Convert italic text (single asterisk, but not part of lists)
  html = html.replace(/(?<!\n)\*([^*\n]+?)\*/g, '<em>$1</em>')
  
  // Convert lists
  const lines = html.split('\n')
  const processedLines: string[] = []
  let inList = false
  
  for (const line of lines) {
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listItem = line.trim().substring(2)
      if (!inList) {
        processedLines.push('<ul class="space-y-3 text-gray-700 my-6">')
        inList = true
      }
      processedLines.push(`  <li class="flex items-start"><span class="text-red-600 font-bold mr-3">•</span><span class="leading-relaxed">${listItem}</span></li>`)
    } else {
      if (inList && line.trim() === '') {
        processedLines.push('</ul>')
        inList = false
      }
      processedLines.push(line)
    }
  }
  
  if (inList) {
    processedLines.push('</ul>')
  }
  
  html = processedLines.join('\n')
  
  // Convert paragraphs (lines not already tagged)
  html = html.split('\n\n').map(para => {
    const trimmed = para.trim()
    if (trimmed && 
        !trimmed.includes('<h') && 
        !trimmed.includes('<ul') && 
        !trimmed.includes('<li') &&
        !trimmed.includes('</ul>') &&
        !trimmed.includes('<figure') &&
        !trimmed.includes('![')) {
      return `<p class="mb-6 text-gray-700 leading-relaxed">${trimmed}</p>`
    }
    return para
  }).join('\n\n')
  
  // Handle images with proper formatting
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    // Use the original image URL if it's a valid URL
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      return `
<figure class="my-8">
  <img src="${src}" alt="${alt}" class="w-full rounded-lg shadow-lg">
  ${alt ? `<figcaption class="text-center text-gray-600 text-sm mt-3 italic">${alt}</figcaption>` : ''}
</figure>`
    }
    // For placeholder images, use a relevant stock photo
    return `
<figure class="my-8">
  <img src="https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop" alt="${alt}" class="w-full rounded-lg shadow-lg">
  ${alt ? `<figcaption class="text-center text-gray-600 text-sm mt-3 italic">${alt}</figcaption>` : ''}
</figure>`
  })
  
  // Clean up any empty paragraphs
  html = html.replace(/<p class="mb-6 text-gray-700 leading-relaxed">\s*<\/p>/g, '')
  
  return html
}

// Hardcoded image mapping based on the CSV data
const imageMapping: Record<string, string> = {
  "Men's Fitness: The Complete Guide to Building Your Best Body": "https://images.pexels.com/photos/53271999/pexels-photo-53271999.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  "Workout Tips: Expert Strategies for Maximum Results": "https://images.pexels.com/photos/53271149/pexels-photo-53271149.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  "Nutrition Advice: Fueling Your Body for Optimal Health and Performance": "https://images.pexels.com/photos/53271013/pexels-photo-53271013.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  "Weight Loss for Men: Science-Based Strategies for Sustainable Results": "https://images.pexels.com/photos/53271549/pexels-photo-53271549.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  "Men's Health: Complete Guide to Wellness and Vitality": "https://images.pexels.com/photos/53271184/pexels-photo-53271184.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  "Men's Style: Master Your Personal Fashion and Grooming": "https://images.pexels.com/photos/53271469/pexels-photo-53271469.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  "Entertainment for Men: Your Guide to Movies, Sports, and Pop Culture": "https://images.pexels.com/photos/53271575/pexels-photo-53271575.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  "Muscle Building: The Complete Guide to Gaining Mass and Strength": "https://images.pexels.com/photos/53271756/pexels-photo-53271756.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  "Diet Plans for Men: Customized Nutrition Strategies for Every Goal": "https://images.pexels.com/photos/53271824/pexels-photo-53271824.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop",
  "Exercise Routines: Complete Training Programs for Every Fitness Level": "https://images.pexels.com/photos/53271647/pexels-photo-53271647.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop"
}

export async function POST(request: NextRequest) {
  try {
    // Check for admin authentication
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the user is an admin (you might want to add more robust admin checks)
    const token = authorization.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      )
    }

    console.log('Starting article formatting fix...')
    
    // Fetch all articles from the database
    const { data: articles, error } = await supabaseAdmin
      .from('articles')
      .select('id, title, content, featured_image, slug')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching articles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      )
    }
    
    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { message: 'No articles found in database' },
        { status: 200 }
      )
    }
    
    console.log(`Found ${articles.length} articles to process`)
    
    let successCount = 0
    let failCount = 0
    const errors: string[] = []
    
    for (const article of articles as Article[]) {
      try {
        // Convert the content from markdown to proper HTML
        const formattedContent = convertMarkdownToHtml(article.content)
        
        // Get the original image from mapping if available
        const originalImage = imageMapping[article.title]
        const featuredImage = originalImage || article.featured_image || 
          `https://images.pexels.com/photos/${Math.floor(Math.random() * 9000000) + 1000000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop`
        
        // Update the article in the database
        const { error: updateError } = await supabaseAdmin
          .from('articles')
          .update({ 
            content: formattedContent,
            featured_image: featuredImage
          })
          .eq('id', article.id)
        
        if (updateError) {
          console.error(`Failed to update "${article.title}": ${updateError.message}`)
          errors.push(`${article.title}: ${updateError.message}`)
          failCount++
        } else {
          successCount++
        }
        
      } catch (err) {
        console.error(`Error processing "${article.title}":`, err)
        errors.push(`${article.title}: ${err}`)
        failCount++
      }
    }
    
    // Clear cache by revalidating the paths
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          paths: ['/', '/articles', '/fitness', '/nutrition', '/health', '/style', '/entertainment', '/weight-loss'] 
        })
      })
    } catch (error) {
      console.error('Failed to revalidate cache:', error)
    }
    
    return NextResponse.json({
      message: 'Formatting complete',
      total: articles.length,
      success: successCount,
      failed: failCount,
      errors: errors.length > 0 ? errors : undefined
    })
    
  } catch (error) {
    console.error('Script failed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}