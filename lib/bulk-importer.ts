import JSZip from 'jszip'
import TurndownService from 'turndown'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { ContentEnhancer } from './content-enhancer'

interface ImportFile {
  name: string
  path: string
  content: string
  type: 'html' | 'md' | 'txt'
  size: number
}

interface ProcessedArticle {
  title: string
  slug: string
  content: string
  excerpt: string
  originalFile: string
  status: 'success' | 'error' | 'warning'
  warnings: string[]
  wordCount: number
  estimatedReadTime: number
}

interface ImportResult {
  success: boolean
  totalFiles: number
  processedFiles: number
  articles: ProcessedArticle[]
  errors: string[]
  warnings: string[]
}

interface ImportOptions {
  enhanceContent?: boolean
  replaceImages?: boolean
  addAuthorityLinks?: boolean
  addInternalLinks?: boolean
  categoryId?: string
  authorId?: string
  publishImmediately?: boolean
}

export class BulkImporter {
  private turndownService: TurndownService
  
  constructor() {
    // Configure Turndown for optimal HTML to Markdown conversion
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      fence: '```',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
      linkReferenceStyle: 'full'
    })

    // Configure Turndown rules for better Men's Health content
    this.setupTurndownRules()
  }

  /**
   * Process a ZIP file and extract articles
   */
  async processZipFile(
    zipFile: File, 
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    console.log('📦 Starting bulk import process...')
    
    const result: ImportResult = {
      success: false,
      totalFiles: 0,
      processedFiles: 0,
      articles: [],
      errors: [],
      warnings: []
    }

    try {
      // Load and parse ZIP file
      const zip = await JSZip.loadAsync(zipFile)
      const files = await this.extractFilesFromZip(zip)
      
      result.totalFiles = files.length
      console.log(`📄 Found ${files.length} files in ZIP`)

      if (files.length === 0) {
        result.errors.push('No valid content files found in ZIP')
        return result
      }

      // Process each file
      for (const file of files) {
        try {
          const article = await this.processFile(file, options)
          result.articles.push(article)
          result.processedFiles++
          
          console.log(`✅ Processed: ${file.name} -> ${article.title}`)
        } catch (error) {
          const errorMsg = `Failed to process ${file.name}: ${error}`
          result.errors.push(errorMsg)
          console.error('❌', errorMsg)
        }
      }

      result.success = result.processedFiles > 0
      console.log(`🎉 Bulk import complete: ${result.processedFiles}/${result.totalFiles} files processed`)

      return result
    } catch (error) {
      result.errors.push(`ZIP processing failed: ${error}`)
      console.error('💥 Bulk import failed:', error)
      return result
    }
  }

  /**
   * Extract and filter files from ZIP
   */
  private async extractFilesFromZip(zip: JSZip): Promise<ImportFile[]> {
    const files: ImportFile[] = []
    const supportedExtensions = ['.html', '.htm', '.md', '.markdown', '.txt']

    for (const [path, zipEntry] of Object.entries(zip.files)) {
      // Skip directories and system files
      if (zipEntry.dir || path.startsWith('__MACOSX/') || path.startsWith('.')) {
        continue
      }

      const fileName = path.split('/').pop() || ''
      const extension = '.' + fileName.split('.').pop()?.toLowerCase()

      if (!supportedExtensions.includes(extension)) {
        continue
      }

      try {
        const content = await zipEntry.async('text')
        const fileType = this.detectFileType(fileName, content)

        files.push({
          name: fileName,
          path: path,
          content: content,
          type: fileType,
          size: content.length
        })
      } catch (error) {
        console.warn(`⚠️ Failed to read file ${path}:`, error)
      }
    }

    return files
  }

  /**
   * Process individual file into article
   */
  private async processFile(
    file: ImportFile, 
    options: ImportOptions
  ): Promise<ProcessedArticle> {
    console.log(`🔄 Processing ${file.name} (${file.type})`)

    let content = file.content
    let title = this.extractTitleFromFile(file)
    const warnings: string[] = []

    // Convert HTML to Markdown if needed
    if (file.type === 'html') {
      content = this.convertHtmlToMarkdown(content)
      console.log(`🔄 Converted HTML to Markdown: ${file.name}`)
    }

    // Parse and clean the markdown
    content = await this.parseAndCleanMarkdown(content)

    // Generate slug from title
    const slug = this.generateSlug(title)

    // Enhance content if requested
    if (options.enhanceContent) {
      try {
        const enhanced = await ContentEnhancer.enhanceContent(title, content, {
          useClaude: true,
          rewriteForOriginality: true,
          improveReadability: true,
          addHeadings: true,
          optimizeForSEO: true,
          replaceImages: options.replaceImages,
          addAuthorityLinks: options.addAuthorityLinks,
          addInternalLinks: options.addInternalLinks,
          articleSlug: slug,
          category: 'General'
        })

        title = enhanced.title
        content = enhanced.content
        warnings.push(...enhanced.warnings)

        console.log(`✨ Enhanced content: ${enhanced.wordCount} words, ${enhanced.imageReplacements} images`)
      } catch (error) {
        warnings.push(`Content enhancement failed: ${error}`)
        console.warn(`⚠️ Enhancement failed for ${file.name}:`, error)
      }
    }

    // Calculate metrics
    const wordCount = this.getWordCount(content)
    const estimatedReadTime = Math.ceil(wordCount / 200) // 200 WPM average

    // Generate excerpt
    const excerpt = this.generateExcerpt(content, 160)

    return {
      title,
      slug,
      content,
      excerpt,
      originalFile: file.name,
      status: warnings.length > 0 ? 'warning' : 'success',
      warnings,
      wordCount,
      estimatedReadTime
    }
  }

  /**
   * Setup Turndown rules for better conversion
   */
  private setupTurndownRules(): void {
    // Preserve images with alt text
    this.turndownService.addRule('images', {
      filter: 'img',
      replacement: (content, node: any) => {
        const alt = node.getAttribute('alt') || ''
        const src = node.getAttribute('src') || ''
        const title = node.getAttribute('title') || ''
        
        if (!src) return ''
        
        // Use placeholder for images to be replaced later
        return `![${alt}]({IMAGE_URL}${title ? ` "${title}"` : ''})`
      }
    })

    // Handle blockquotes better
    this.turndownService.addRule('blockquote', {
      filter: 'blockquote',
      replacement: (content) => {
        return content.trim().split('\n').map(line => `> ${line}`).join('\n') + '\n\n'
      }
    })

    // Preserve code blocks
    this.turndownService.addRule('codeBlock', {
      filter: ['pre'],
      replacement: (content, node: any) => {
        const code = node.querySelector('code')
        const language = code?.getAttribute('class')?.replace('language-', '') || ''
        return `\`\`\`${language}\n${content}\n\`\`\`\n\n`
      }
    })

    // Remove unwanted elements
    this.turndownService.remove(['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe'])
  }

  /**
   * Convert HTML to clean Markdown
   */
  private convertHtmlToMarkdown(html: string): string {
    // Clean up common HTML issues first
    let cleaned = html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/\s+/g, ' ')
    
    // Convert to Markdown
    return this.turndownService.turndown(cleaned)
  }

  /**
   * Parse and clean Markdown content
   */
  private async parseAndCleanMarkdown(content: string): Promise<string> {
    try {
      const processor = unified()
        .use(remarkParse)
        .use(remarkStringify, {
          bullet: '-',
          fence: '`',
          fences: true,
          incrementListMarker: false
        })

      const result = await processor.process(content)
      return result.toString()
    } catch (error) {
      console.warn('⚠️ Markdown parsing failed, using original content:', error)
      return content
    }
  }

  /**
   * Extract title from file content or filename
   */
  private extractTitleFromFile(file: ImportFile): string {
    // Try to extract from content first
    if (file.type === 'html') {
      const titleMatch = file.content.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) {
        return this.cleanTitle(titleMatch[1])
      }

      const h1Match = file.content.match(/<h1[^>]*>([^<]+)<\/h1>/i)
      if (h1Match) {
        return this.cleanTitle(h1Match[1])
      }
    } else if (file.type === 'md') {
      const h1Match = file.content.match(/^#\s+(.+)$/m)
      if (h1Match) {
        return this.cleanTitle(h1Match[1])
      }
    }

    // Fallback to filename
    return this.cleanTitle(
      file.name.replace(/\.(html?|md|markdown|txt)$/i, '')
    )
  }

  /**
   * Clean and format title
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, l => l.toUpperCase()) // Title case
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  /**
   * Detect file type from name and content
   */
  private detectFileType(fileName: string, content: string): 'html' | 'md' | 'txt' {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (extension === 'html' || extension === 'htm') {
      return 'html'
    }
    
    if (extension === 'md' || extension === 'markdown') {
      return 'md'
    }
    
    // Auto-detect based on content
    if (content.includes('<html') || content.includes('<body') || content.includes('<div')) {
      return 'html'
    }
    
    if (content.includes('# ') || content.includes('## ') || content.includes('**') || content.includes('![')) {
      return 'md'
    }
    
    return 'txt'
  }

  /**
   * Get word count from content
   */
  private getWordCount(content: string): number {
    return content
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 0).length
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string, maxLength: number = 160): string {
    const text = content
      .replace(/[#*`>\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    const words = text.split(' ').slice(0, Math.floor(maxLength / 6))
    let excerpt = words.join(' ')
    
    if (excerpt.length > maxLength) {
      excerpt = excerpt.substring(0, maxLength - 3)
    }
    
    return excerpt + (words.length >= Math.floor(maxLength / 6) ? '...' : '')
  }

  /**
   * Save processed articles to database
   */
  async saveArticles(
    articles: ProcessedArticle[],
    options: ImportOptions,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    console.log(`💾 Saving ${articles.length} articles to database...`)
    
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      
      try {
        const response = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt,
            categoryId: options.categoryId,
            authorId: options.authorId,
            published: options.publishImmediately || false,
            featured: false,
            trending: false
          }),
        })

        if (response.ok) {
          success++
          console.log(`✅ Saved: ${article.title}`)
        } else {
          failed++
          const error = await response.text()
          errors.push(`Failed to save "${article.title}": ${error}`)
        }
      } catch (error) {
        failed++
        errors.push(`Database error for "${article.title}": ${error}`)
      }

      // Report progress
      if (onProgress) {
        onProgress(i + 1, articles.length)
      }
    }

    console.log(`🎉 Import complete: ${success} saved, ${failed} failed`)
    return { success, failed, errors }
  }
}

/**
 * Export convenience function for one-shot imports
 */
export async function importFromZip(
  zipFile: File,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const importer = new BulkImporter()
  return await importer.processZipFile(zipFile, options)
} 