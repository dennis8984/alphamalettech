import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

interface ParsedArticle {
  title: string
  content: string
  excerpt: string
  category: string
  author: string
  image: string
  date: string
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
      
      if (!categoryMatch || !metaDescMatch) {
        console.warn(`Skipping article "${title}" - missing meta information`)
        continue
      }
      
      const category = categoryMatch[1].trim()
      const metaDescription = metaDescMatch[1].trim()
      
      // Extract content (everything after the meta information)
      const contentStartIndex = section.indexOf('#### Introduction')
      if (contentStartIndex === -1) {
        console.warn(`Skipping article "${title}" - no content found`)
        continue
      }
      
      let content = section.substring(contentStartIndex)
      
      // Remove the FAQ section
      const faqIndex = content.indexOf('#### Frequently Asked Questions')
      if (faqIndex !== -1) {
        content = content.substring(0, faqIndex).trim()
      }
      
      // Clean up the content for CSV (remove excessive newlines, keep basic formatting)
      content = content
        .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
        .replace(/"/g, '""') // Escape quotes for CSV
        .trim()
      
      // Generate a random stock photo URL
      const randomImageId = Math.floor(Math.random() * 1000) + 1000
      const image = `https://images.pexels.com/photos/5327${randomImageId}/pexels-photo-5327${randomImageId}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop`
      
      articles.push({
        title,
        content,
        excerpt: metaDescription,
        category,
        author: 'Men\'s Health Editorial Team',
        image,
        date: new Date().toISOString().split('T')[0]
      })
      
      console.log(`✅ Parsed article: "${title}" (${category})`)
      
    } catch (error) {
      console.error(`Error parsing article section:`, error)
    }
  }
  
  return articles
}

async function convertMarkdownToCsv() {
  try {
    console.log('🚀 Starting markdown to CSV conversion...\n')
    
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
      console.error('❌ No articles found to convert!')
      return
    }
    
    // Convert to CSV
    const csv = Papa.unparse(articles, {
      header: true,
      columns: ['title', 'content', 'excerpt', 'category', 'author', 'image', 'date']
    })
    
    // Save CSV file
    const csvPath = path.join(process.cwd(), 'articles-import.csv')
    fs.writeFileSync(csvPath, csv, 'utf-8')
    
    console.log('\n' + '='.repeat(60))
    console.log(`🎉 Conversion Complete!`)
    console.log(`✅ Created CSV file: articles-import.csv`)
    console.log(`📊 Total articles: ${articles.length}`)
    console.log('='.repeat(60))
    
    console.log('\n📌 Next steps:')
    console.log('1. Go to /admin/import in your browser')
    console.log('2. Upload the articles-import.csv file')
    console.log('3. Map the CSV columns if needed')
    console.log('4. Review and import the articles')
    
    // Show category distribution
    const categoryCount: Record<string, number> = {}
    articles.forEach(article => {
      categoryCount[article.category] = (categoryCount[article.category] || 0) + 1
    })
    
    console.log('\n📊 Articles by category:')
    Object.entries(categoryCount).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} articles`)
    })
    
  } catch (error) {
    console.error('❌ Conversion failed:', error)
  }
}

// Run the conversion
console.log('Markdown to CSV Converter')
console.log('========================\n')

convertMarkdownToCsv()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })