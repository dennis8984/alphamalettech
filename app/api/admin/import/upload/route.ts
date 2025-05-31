import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { unlink } from 'fs/promises'
import JSZip from 'jszip'
import Papa from 'papaparse'
import { DOMParser } from '@xmldom/xmldom'
import { createHash } from 'crypto'

interface ParsedArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  category: string
  author: string
  date: string
  featured: boolean
  trending: boolean
  filename: string
  status: 'ready' | 'warning' | 'error'
  warnings: string[]
  wordCount: number
  size: string
}

const ALLOWED_CATEGORIES = ['fitness', 'nutrition', 'health', 'style', 'weight-loss', 'entertainment']
const DEFAULT_IMAGE = 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file = data.get('file') as File
    const fieldMappings = data.get('fieldMappings') as string | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type)

    const uploadDir = join(process.cwd(), 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileHash = createHash('md5').update(buffer).digest('hex')
    const tempPath = join(uploadDir, `${fileHash}_${file.name}`)

    // Save uploaded file temporarily
    await writeFile(tempPath, buffer)

    let parsedArticles: ParsedArticle[] = []
    let csvHeaders: string[] | null = null

    try {
      if (file.name.endsWith('.zip')) {
        parsedArticles = await processZipFile(buffer)
      } else if (file.name.endsWith('.csv')) {
        // Check if we need to return headers for mapping
        if (!fieldMappings) {
          // First pass - just get headers
          console.log('Getting CSV headers...')
          csvHeaders = await getCsvHeaders(buffer)
          console.log('CSV headers detected:', csvHeaders)
          return NextResponse.json({
            success: true,
            needsMapping: true,
            headers: csvHeaders,
            fileName: file.name
          })
        } else {
          // Second pass - process with mappings
          console.log('Processing CSV with mappings:', fieldMappings)
          const mappings = JSON.parse(fieldMappings)
          parsedArticles = await processCsvFile(buffer, mappings)
        }
      } else if (file.name.endsWith('.xml')) {
        parsedArticles = await processXmlFile(buffer)
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        parsedArticles = await processHtmlFile(buffer, file.name)
      } else {
        return NextResponse.json({ error: 'Unsupported file format. Please upload ZIP, CSV, XML, or HTML files.' }, { status: 400 })
      }

      // Clean up temp file
      await unlink(tempPath).catch(() => {})

      console.log(`Processed ${parsedArticles.length} articles`)

      return NextResponse.json({
        success: true,
        articles: parsedArticles,
        totalCount: parsedArticles.length,
        readyCount: parsedArticles.filter(a => a.status === 'ready').length,
        warningCount: parsedArticles.filter(a => a.status === 'warning').length,
        errorCount: parsedArticles.filter(a => a.status === 'error').length
      })

    } catch (parseError) {
      // Clean up temp file on error
      await unlink(tempPath).catch(() => {})
      console.error('Parse error:', parseError)
      throw parseError
    }

  } catch (error) {
    console.error('Import upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to process upload: ${errorMessage}` },
      { status: 500 }
    )
  }
}

async function processZipFile(buffer: Buffer): Promise<ParsedArticle[]> {
  const zip = new JSZip()
  const zipData = await zip.loadAsync(buffer)
  const articles: ParsedArticle[] = []

  for (const [filename, file] of Object.entries(zipData.files)) {
    if (file.dir) continue

    const content = await file.async('text')
    const ext = filename.toLowerCase().split('.').pop()

    if (ext === 'html' || ext === 'htm') {
      const article = parseHtmlContent(content, filename)
      articles.push(article)
    } else if (ext === 'md' || ext === 'markdown') {
      const article = parseMarkdownContent(content, filename)
      articles.push(article)
    } else if (ext === 'csv') {
      const csvArticles = await processCsvContent(content, undefined)
      articles.push(...csvArticles)
    }
  }

  return articles
}

async function processCsvFile(buffer: Buffer, mappings?: Record<string, string>): Promise<ParsedArticle[]> {
  const content = buffer.toString('utf-8')
  return await processCsvContent(content, mappings)
}

async function processCsvContent(content: string, mappings?: Record<string, string>): Promise<ParsedArticle[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: function(results: any) {
        try {
          const articles: ParsedArticle[] = []
          
          if (results.data && Array.isArray(results.data)) {
            results.data.forEach((row: any, index: number) => {
              const article = mapCsvRowToArticle(row, index, mappings)
              articles.push(article)
            })
          }
          
          resolve(articles)
        } catch (error) {
          reject(error)
        }
      },
      error: function(error: any) {
        reject(error)
      }
    })
  })
}

async function processXmlFile(buffer: Buffer): Promise<ParsedArticle[]> {
  const content = buffer.toString('utf-8')
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(content, 'text/xml')
  
  const articles: ParsedArticle[] = []
  const items = xmlDoc.getElementsByTagName('item') || xmlDoc.getElementsByTagName('article')
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const article = parseXmlItem(item, i)
    articles.push(article)
  }
  
  return articles
}

async function processHtmlFile(buffer: Buffer, filename: string): Promise<ParsedArticle[]> {
  const content = buffer.toString('utf-8')
  const article = parseHtmlContent(content, filename)
  return [article]
}

function parseHtmlContent(content: string, filename: string): ParsedArticle {
  const warnings: string[] = []
  
  // Extract title
  const titleMatch = content.match(/<title[^>]*>(.*?)<\/title>/i) || 
                    content.match(/<h1[^>]*>(.*?)<\/h1>/i)
  const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : 
                filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  
  // Extract content - using more compatible regex patterns
  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i) ||
                   content.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                   content.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  
  let articleContent = bodyMatch ? bodyMatch[1] : content
  
  // Clean up content - using more compatible regex patterns
  articleContent = articleContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .trim()
  
  // Extract excerpt
  const pMatch = articleContent.match(/<p[^>]*>(.*?)<\/p>/i)
  const excerpt = pMatch ? pMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 200) + '...' : 
                  title.substring(0, 200) + '...'
  
  // Extract images
  const imgMatches = content.match(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi) || []
  let firstImage = DEFAULT_IMAGE
  if (imgMatches.length > 0 && imgMatches[0]) {
    const srcMatch = imgMatches[0].match(/src=["']([^"']*)/)
    if (srcMatch && srcMatch[1]) {
      firstImage = srcMatch[1]
    }
  }
  
  // Check for missing alt tags
  const imgsWithoutAlt = content.match(/<img(?![^>]*alt=)[^>]*>/gi) || []
  if (imgsWithoutAlt.length > 0) {
    warnings.push(`${imgsWithoutAlt.length} images missing alt tags`)
  }
  
  // Word count
  const textContent = articleContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = textContent.split(' ').filter(word => word.length > 0).length
  
  // Generate slug
  const slug = generateSlug(title)
  
  // Auto-detect category
  const category = detectCategory(title + ' ' + textContent)
  
  // Determine status
  let status: 'ready' | 'warning' | 'error' = 'ready'
  if (warnings.length > 0 || wordCount < 300) {
    status = 'warning'
    if (wordCount < 300) warnings.push('Article too short (less than 300 words)')
  }
  if (wordCount < 100) {
    status = 'error'
    warnings.push('Article extremely short (less than 100 words)')
  }
  
  return {
    id: generateId(),
    title,
    slug,
    excerpt,
    content: articleContent,
    image: firstImage,
    category,
    author: 'Imported Author',
    date: new Date().toISOString().split('T')[0],
    featured: false,
    trending: false,
    filename,
    status,
    warnings,
    wordCount,
    size: `${Math.round(content.length / 1024)}KB`
  }
}

function parseMarkdownContent(content: string, filename: string): ParsedArticle {
  const warnings: string[] = []
  
  // Extract title from # heading or filename
  const titleMatch = content.match(/^#\s+(.*)$/m)
  const title = titleMatch ? titleMatch[1].trim() : 
                filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  
  // Remove title from content
  let articleContent = titleMatch ? content.replace(/^#\s+.*$/m, '').trim() : content
  
  // Extract excerpt
  const firstParagraph = articleContent.split('\n\n')[0]
  const excerpt = firstParagraph.replace(/[#*_`]/g, '').trim().substring(0, 200) + '...'
  
  // Convert markdown to HTML (basic conversion)
  articleContent = articleContent
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '<p>')
    .replace(/$(?![hul>])/gm, '</p>')
  
  // Extract images
  const imgMatches = content.match(/!\[.*?\]\((.*?)\)/g) || []
  let firstImage = DEFAULT_IMAGE
  if (imgMatches.length > 0 && imgMatches[0]) {
    const urlMatch = imgMatches[0].match(/\((.*?)\)/)
    if (urlMatch && urlMatch[1]) {
      firstImage = urlMatch[1]
    }
  }
  
  // Word count
  const textContent = content.replace(/[#*_`\[\]()]/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = textContent.split(' ').filter(word => word.length > 0).length
  
  if (wordCount < 300) warnings.push('Article too short (less than 300 words)')
  
  return {
    id: generateId(),
    title,
    slug: generateSlug(title),
    excerpt,
    content: articleContent,
    image: firstImage,
    category: detectCategory(title + ' ' + textContent),
    author: 'Imported Author',
    date: new Date().toISOString().split('T')[0],
    featured: false,
    trending: false,
    filename,
    status: warnings.length > 0 ? 'warning' : 'ready',
    warnings,
    wordCount,
    size: `${Math.round(content.length / 1024)}KB`
  }
}

function mapCsvRowToArticle(row: Record<string, string>, index: number, mappings?: Record<string, string>): ParsedArticle {
  const warnings: string[] = []
  
  // Use mappings if provided, otherwise fall back to flexible field mapping
  const getValue = (field: string, fallbacks?: string[]): string => {
    if (mappings && mappings[field] && row[mappings[field]]) {
      return row[mappings[field]]
    }
    // If no mapping, try the standard field names
    if (row[field]) return row[field]
    // Try fallbacks
    if (fallbacks) {
      for (const fallback of fallbacks) {
        if (row[fallback]) return row[fallback]
      }
    }
    return ''
  }
  
  const title = getValue('title', ['Title', 'headline', 'Headline']) || `Imported Article ${index + 1}`
  const content = getValue('content', ['Content', 'body', 'Body', 'description', 'Description']) || ''
  const excerpt = getValue('excerpt', ['Excerpt', 'summary', 'Summary']) || content.substring(0, 200) + '...'
  const category = getValue('category', ['Category', 'tag', 'Tag']) || detectCategory(title + ' ' + content)
  const author = getValue('author', ['Author', 'writer', 'Writer']) || 'Imported Author'
  const image = getValue('image', ['Image', 'thumbnail', 'Thumbnail', 'image_url', 'imageUrl']) || DEFAULT_IMAGE
  const date = getValue('date', ['Date', 'publishDate', 'publish_date', 'published_at']) || new Date().toISOString().split('T')[0]
  
  // Validate required fields
  if (!title.trim()) warnings.push('Missing title')
  if (!content.trim()) warnings.push('Missing content')
  if (content.length < 300) warnings.push('Content too short')
  
  const wordCount = content.split(' ').filter((word: string) => word.length > 0).length
  
  return {
    id: generateId(),
    title,
    slug: generateSlug(title),
    excerpt,
    content,
    image,
    category: ALLOWED_CATEGORIES.includes(category.toLowerCase()) ? category.toLowerCase() : 'health',
    author,
    date,
    featured: false,
    trending: false,
    filename: `row_${index + 1}.csv`,
    status: warnings.length > 0 ? 'warning' : 'ready',
    warnings,
    wordCount,
    size: `${Math.round(content.length / 1024)}KB`
  }
}

function parseXmlItem(item: Element, index: number): ParsedArticle {
  const warnings: string[] = []
  
  const getElementText = (tagName: string): string => {
    const element = item.getElementsByTagName(tagName)[0]
    return element ? element.textContent || '' : ''
  }
  
  const title = getElementText('title') || getElementText('headline') || `Imported Article ${index + 1}`
  const content = getElementText('content') || getElementText('description') || getElementText('body') || ''
  const excerpt = getElementText('excerpt') || getElementText('summary') || content.substring(0, 200) + '...'
  const category = getElementText('category') || getElementText('tag') || detectCategory(title + ' ' + content)
  const author = getElementText('author') || getElementText('creator') || 'Imported Author'
  const image = getElementText('image') || getElementText('thumbnail') || DEFAULT_IMAGE
  const date = getElementText('date') || getElementText('pubDate') || new Date().toISOString().split('T')[0]
  
  // Validate
  if (!title.trim()) warnings.push('Missing title')
  if (!content.trim()) warnings.push('Missing content')
  if (content.length < 300) warnings.push('Content too short')
  
  const wordCount = content.split(' ').filter(word => word.length > 0).length
  
  return {
    id: generateId(),
    title,
    slug: generateSlug(title),
    excerpt,
    content,
    image,
    category: ALLOWED_CATEGORIES.includes(category.toLowerCase()) ? category.toLowerCase() : 'health',
    author,
    date,
    featured: false,
    trending: false,
    filename: `item_${index + 1}.xml`,
    status: warnings.length > 0 ? 'warning' : 'ready',
    warnings,
    wordCount,
    size: `${Math.round(content.length / 1024)}KB`
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 60)
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

function detectCategory(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('workout') || lowerText.includes('exercise') || lowerText.includes('training') || lowerText.includes('muscle')) {
    return 'fitness'
  }
  if (lowerText.includes('protein') || lowerText.includes('diet') || lowerText.includes('nutrition') || lowerText.includes('food')) {
    return 'nutrition'
  }
  if (lowerText.includes('weight') || lowerText.includes('fat') || lowerText.includes('lose') || lowerText.includes('slim')) {
    return 'weight-loss'
  }
  if (lowerText.includes('style') || lowerText.includes('fashion') || lowerText.includes('clothing') || lowerText.includes('shoes')) {
    return 'style'
  }
  if (lowerText.includes('movie') || lowerText.includes('show') || lowerText.includes('entertainment') || lowerText.includes('streaming')) {
    return 'entertainment'
  }
  
  return 'health' // Default category
}

async function getCsvHeaders(buffer: Buffer): Promise<string[]> {
  const content = buffer.toString('utf-8')
  console.log('CSV content preview (first 200 chars):', content.substring(0, 200))
  
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      preview: 1, // Only parse the first row to get headers
      skipEmptyLines: true,
      complete: function(results: any) {
        console.log('Papa parse results:', results)
        if (results.meta && results.meta.fields) {
          console.log('Found headers from meta.fields:', results.meta.fields)
          resolve(results.meta.fields)
        } else if (results.data && results.data[0]) {
          // If no header row, use first row keys
          const headers = Object.keys(results.data[0])
          console.log('Found headers from first row:', headers)
          resolve(headers)
        } else {
          console.log('No headers found')
          resolve([])
        }
      },
      error: function(error: any) {
        console.error('Papa parse error:', error)
        reject(new Error(`CSV parsing error: ${error.message || 'Unknown error'}`))
      }
    })
  })
} 