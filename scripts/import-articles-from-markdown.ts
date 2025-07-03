import { createArticle } from '../lib/articles-db'
import { clearArticlesCache } from '../lib/data'
import fs from 'fs'
import path from 'path'

interface ParsedArticle {
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  author: string
  tags: string[]
  metaDescription: string
  targetKeyword: string
}

function parseMarkdownArticles(markdown: string): ParsedArticle[] {
  const articles: ParsedArticle[] = []
  
  // Split by article sections (### followed by number)
  const articleSections = markdown.split(/(?=^### \d+\.)/gm)
  
  for (const section of articleSections) {
    if (!section.trim() || !section.includes('###')) continue
    
    try {
      // Extract title
      const titleMatch = section.match(/^### \d+\.\s+(.+)$/m)
      if (!titleMatch) continue
      const title = titleMatch[1].trim()
      
      // Extract meta information
      const targetKeywordMatch = section.match(/\*\*Target Keyword:\*\*\s*(.+)$/m)
      const categoryMatch = section.match(/\*\*Category:\*\*\s*(.+)$/m)
      const metaDescMatch = section.match(/\*\*Meta Description:\*\*\s*(.+)$/m)
      
      if (!targetKeywordMatch || !categoryMatch || !metaDescMatch) {
        console.warn(`Skipping article "${title}" - missing meta information`)
        continue
      }
      
      const targetKeyword = targetKeywordMatch[1].trim()
      const category = categoryMatch[1].trim()
      const metaDescription = metaDescMatch[1].trim()
      
      // Extract content (everything after the meta information)
      const contentStartIndex = section.indexOf('#### Introduction')
      if (contentStartIndex === -1) {
        console.warn(`Skipping article "${title}" - no content found`)
        continue
      }
      
      let content = section.substring(contentStartIndex)
      
      // Remove the FAQ section as it's typically at the end
      const faqIndex = content.indexOf('#### Frequently Asked Questions')
      if (faqIndex !== -1) {
        content = content.substring(0, faqIndex).trim()
      }
      
      // Convert markdown to HTML-like format for database storage
      content = convertMarkdownToHtml(content)
      
      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      // Extract tags based on category and content
      const tags = extractTags(category, content, targetKeyword)
      
      articles.push({
        title,
        slug,
        content,
        excerpt: metaDescription,
        category,
        author: 'Men\'s Health Editorial Team',
        tags,
        metaDescription,
        targetKeyword
      })
      
      console.log(`✅ Parsed article: "${title}" (${category})`)
      
    } catch (error) {
      console.error(`Error parsing article section:`, error)
    }
  }
  
  return articles
}

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
    // For AI Generated Image placeholders, use a relevant stock photo
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

function extractTags(category: string, content: string, keyword: string): string[] {
  const tags = new Set<string>()
  
  // Add category as a tag
  tags.add(category)
  
  // Add target keyword as tag
  if (keyword && keyword !== category) {
    tags.add(keyword.replace(/\s+/g, '-'))
  }
  
  // Extract common fitness/health related tags from content
  const commonTags = [
    'workout', 'nutrition', 'muscle-building', 'cardio', 'strength-training',
    'weight-loss', 'protein', 'supplements', 'testosterone', 'recovery',
    'diet', 'exercise', 'health-tips', 'fitness-goals', 'training'
  ]
  
  const contentLower = content.toLowerCase()
  for (const tag of commonTags) {
    if (contentLower.includes(tag.replace('-', ' ')) || contentLower.includes(tag)) {
      tags.add(tag)
    }
  }
  
  // Limit to 5 most relevant tags
  return Array.from(tags).slice(0, 5)
}

async function importArticles() {
  try {
    console.log('🚀 Starting article import from article-prompts.md...\n')
    
    // Read the markdown file
    const markdownPath = path.join(process.cwd(), 'article-prompts.md')
    if (!fs.existsSync(markdownPath)) {
      console.error('❌ article-prompts.md file not found!')
      return
    }
    
    const markdownContent = fs.readFileSync(markdownPath, 'utf-8')
    console.log(`📄 Read ${markdownContent.length} characters from article-prompts.md\n`)
    
    // Parse articles
    const articles = parseMarkdownArticles(markdownContent)
    console.log(`\n📊 Parsed ${articles.length} articles from markdown\n`)
    
    if (articles.length === 0) {
      console.error('❌ No articles found to import!')
      return
    }
    
    // Import each article
    let successCount = 0
    let failCount = 0
    
    for (const article of articles) {
      console.log(`\n📝 Importing: "${article.title}"...`)
      
      const { data, error } = await createArticle({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        category: article.category,
        status: 'published',
        featured_image: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000) + 1000000}/pexels-photo-${Math.floor(Math.random() * 1000000) + 1000000}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop`,
        tags: article.tags,
        author: article.author
      })
      
      if (error) {
        console.error(`❌ Failed to import "${article.title}": ${error}`)
        failCount++
      } else {
        console.log(`✅ Successfully imported "${article.title}" with ID: ${data?.id}`)
        successCount++
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    // Clear the article cache to ensure fresh data
    clearArticlesCache()
    
    console.log('\n' + '='.repeat(60))
    console.log(`🎉 Import Complete!`)
    console.log(`✅ Successfully imported: ${successCount} articles`)
    if (failCount > 0) {
      console.log(`❌ Failed: ${failCount} articles`)
    }
    console.log('='.repeat(60))
    
    console.log('\n📌 Next steps:')
    console.log('1. Visit your website to see the imported articles')
    console.log('2. Check the admin panel at /admin/articles to manage them')
    console.log('3. Articles should appear on the homepage and category pages')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
  }
}

// Run the import
console.log('Men\'s Health Article Import Script')
console.log('==================================\n')

importArticles()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })