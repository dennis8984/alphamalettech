import { supabase } from '../lib/supabase'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface Article {
  id: string
  title: string
  content: string
  featured_image: string | null
  slug: string
}

interface CSVArticle {
  title: string
  content: string
  excerpt: string
  category: string
  author: string
  image: string
  date: string
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
    // Use the original image URL from the CSV if it's a valid URL
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

// Function to extract images from original CSV
async function getOriginalImages(): Promise<Map<string, string>> {
  const csvPath = path.join(process.cwd(), 'articles-import.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  }) as CSVArticle[]
  
  const imageMap = new Map<string, string>()
  
  for (const record of records) {
    if (record.title && record.image) {
      imageMap.set(record.title, record.image)
    }
  }
  
  return imageMap
}

async function fixArticleFormatting() {
  try {
    console.log('🚀 Starting article formatting fix...\n')
    
    // Get original images from CSV
    const originalImages = await getOriginalImages()
    console.log(`📷 Found ${originalImages.size} original images from CSV\n`)
    
    // Fetch all articles from the database
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, content, featured_image, slug')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching articles:', error)
      return
    }
    
    if (!articles || articles.length === 0) {
      console.log('❌ No articles found in database')
      return
    }
    
    console.log(`📄 Found ${articles.length} articles to process\n`)
    
    let successCount = 0
    let failCount = 0
    
    for (const article of articles as Article[]) {
      console.log(`\n📝 Processing: "${article.title}"...`)
      
      try {
        // Convert the content from markdown to proper HTML
        const formattedContent = convertMarkdownToHtml(article.content)
        
        // Get the original image from CSV if available
        const originalImage = originalImages.get(article.title)
        const featuredImage = originalImage || article.featured_image || 
          `https://images.pexels.com/photos/${Math.floor(Math.random() * 9000000) + 1000000}/pexels-photo.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop`
        
        // Update the article in the database
        const { error: updateError } = await supabase
          .from('articles')
          .update({ 
            content: formattedContent,
            featured_image: featuredImage
          })
          .eq('id', article.id)
        
        if (updateError) {
          console.error(`❌ Failed to update "${article.title}": ${updateError.message}`)
          failCount++
        } else {
          console.log(`✅ Successfully formatted "${article.title}"`)
          if (originalImage) {
            console.log(`   📷 Updated with original image`)
          }
          successCount++
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (err) {
        console.error(`❌ Error processing "${article.title}":`, err)
        failCount++
      }
    }
    
    console.log('\n' + '='.repeat(60))
    console.log(`🎉 Formatting Complete!`)
    console.log(`✅ Successfully formatted: ${successCount} articles`)
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount} articles`)
    }
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

// Run the formatting fix
console.log('Article Formatting Fix Script')
console.log('============================\n')

fixArticleFormatting()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })