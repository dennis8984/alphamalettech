import Anthropic from '@anthropic-ai/sdk'

interface ClaudeEnhancementOptions {
  rewriteForOriginality?: boolean
  improveReadability?: boolean
  addHeadings?: boolean
  optimizeForSEO?: boolean
  primaryKeyword?: string
  maxTokens?: number
}

interface ClaudeEnhancedContent {
  title: string
  content: string
  excerpt: string
  metaDescription?: string
  warnings: string[]
}

export class ClaudeContentEnhancer {
  private claude: Anthropic
  
  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY environment variable is required')
    }
    
    this.claude = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    })
  }

  /**
   * Enhance content using Claude AI with Men's Health editorial style
   */
  async enhanceContent(
    title: string,
    content: string,
    options: ClaudeEnhancementOptions = {}
  ): Promise<ClaudeEnhancedContent> {
    console.log('🤖 Starting Claude AI content enhancement...')
    
    const primaryKeyword = options.primaryKeyword || this.extractPrimaryKeyword(title)
    const warnings: string[] = []
    
    let enhancedTitle = title
    let enhancedContent = content
    let metaDescription: string | undefined

    try {
      // Step 1: Rewrite for originality if requested
      if (options.rewriteForOriginality) {
        console.log('✍️ Rewriting with Claude for Men\'s Health originality...')
        const rewriteResult = await this.rewriteForMensHealthStyle(title, content, primaryKeyword)
        enhancedTitle = rewriteResult.title
        enhancedContent = rewriteResult.content
      }

      // Step 2: Improve readability and structure
      if (options.improveReadability) {
        console.log('📖 Improving readability with Claude...')
        enhancedContent = await this.improveReadabilityWithClaude(enhancedContent, primaryKeyword)
      }

      // Step 3: Add strategic headings
      if (options.addHeadings) {
        console.log('📝 Adding strategic headings with Claude...')
        enhancedContent = await this.addStrategicHeadings(enhancedContent, primaryKeyword)
      }

      // Step 4: Generate SEO metadata
      if (options.optimizeForSEO) {
        console.log('🔍 Optimizing SEO metadata with Claude...')
        metaDescription = await this.generateSEOMetadata(enhancedTitle, enhancedContent, primaryKeyword)
      }

    } catch (error) {
      console.error('❌ Claude AI enhancement failed:', error)
      warnings.push(`Claude AI enhancement failed: ${error}`)
    }

    // Generate excerpt
    const excerpt = this.generateExcerpt(enhancedContent)

    console.log('✅ Claude AI content enhancement complete!')
    
    return {
      title: enhancedTitle,
      content: enhancedContent,
      excerpt,
      metaDescription,
      warnings
    }
  }

  /**
   * Rewrite content in Men's Health editorial style using Claude
   */
  private async rewriteForMensHealthStyle(
    title: string,
    content: string,
    primaryKeyword: string
  ): Promise<{ title: string; content: string }> {
    
    const prompt = `You are a senior editor at Men's Health magazine. Rewrite this fitness/health article to match the signature Men's Health editorial style:

TITLE: ${title}
CONTENT: ${content}

KEY REQUIREMENTS:
1. **Compelling Hook**: Start with an ALL-CAPS attention-grabbing statement or shocking fact
2. **Second-Person Voice**: Use "you" throughout - make it personal and direct
3. **Authority & Urgency**: Include phrases like "science proves", "research shows", "experts confirm"
4. **Men's Health Tone**: Confident, motivational, no-nonsense, slightly aggressive
5. **Action-Oriented**: Focus on what readers can DO, not just theory
6. **Keyword Integration**: Naturally work in "${primaryKeyword}" throughout
7. **Power Words**: Use words like "ultimate", "proven", "game-changing", "breakthrough"

STRUCTURE:
- Lead with ALL-CAPS hook sentence
- Quick takeaways box (3-5 bullet points)
- Expert quotes in blockquotes
- Action steps or numbered lists
- Strategic H2 headings every 150-250 words

EXAMPLES OF MEN'S HEALTH STYLE:
- "YOUR WORKOUT IS SABOTAGING YOUR GAINS. Here's how to fix it in 30 days."
- "The biggest mistake guys make is..."
- "This changes everything you know about..."
- "You've been doing it wrong—here's why"

Return ONLY the rewritten content in this JSON format:
{
  "title": "Enhanced title in Men's Health style",
  "content": "Full enhanced article content with HTML formatting"
}`

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
      const parsedResponse = JSON.parse(responseText)
      
      return {
        title: parsedResponse.title || title,
        content: parsedResponse.content || content
      }
    } catch (error) {
      console.error('❌ Claude rewrite failed:', error)
      return { title, content }
    }
  }

  /**
   * Improve readability using Claude
   */
  private async improveReadabilityWithClaude(content: string, primaryKeyword: string): Promise<string> {
    const prompt = `Improve the readability of this Men's Health article content while maintaining the editorial voice:

CONTENT: ${content}

IMPROVEMENTS NEEDED:
1. **Sentence Variety**: Mix short punchy sentences with longer explanatory ones
2. **Paragraph Flow**: Ensure smooth transitions between ideas
3. **Active Voice**: Convert passive voice to active where possible
4. **Clarity**: Simplify complex sentences without losing meaning
5. **Engagement**: Add rhetorical questions and direct addresses to reader
6. **Keyword Flow**: Ensure "${primaryKeyword}" appears naturally throughout

MAINTAIN:
- Men's Health confident tone
- All existing HTML formatting and structure
- Expert quotes and special boxes
- Action-oriented language

Return only the improved content with all HTML formatting preserved:`

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        temperature: 0.5,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      return response.content[0].type === 'text' ? response.content[0].text : content
    } catch (error) {
      console.error('❌ Claude readability improvement failed:', error)
      return content
    }
  }

  /**
   * Add strategic headings using Claude
   */
  private async addStrategicHeadings(content: string, primaryKeyword: string): Promise<string> {
    const prompt = `Add strategic H2 headings to this Men's Health article to improve scannability and SEO:

CONTENT: ${content}

HEADING REQUIREMENTS:
1. **H2 Every 150-250 words**: Break up long sections
2. **SEO Optimized**: Include "${primaryKeyword}" in some headings naturally
3. **Engaging**: Use Men's Health style - action-oriented, benefit-driven
4. **Logical Flow**: Headings should follow article progression
5. **Scannable**: Readers should understand content flow from headings alone

HEADING STYLE EXAMPLES:
- "Why ${primaryKeyword} Changes Everything"
- "The Science Behind [Topic] Success"
- "Expert-Approved [Topic] Strategies"
- "Common [Topic] Mistakes That Kill Results"
- "Advanced Techniques for Maximum Impact"
- "How to Maximize Your Results in Record Time"

Add H2 headings with this HTML format:
<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">Heading Text</h2>

Return the complete content with strategic headings added:`

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        temperature: 0.6,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      return response.content[0].type === 'text' ? response.content[0].text : content
    } catch (error) {
      console.error('❌ Claude heading addition failed:', error)
      return content
    }
  }

  /**
   * Generate SEO metadata using Claude
   */
  private async generateSEOMetadata(
    title: string,
    content: string,
    primaryKeyword: string
  ): Promise<string> {
    const prompt = `Create an SEO-optimized meta description for this Men's Health article:

TITLE: ${title}
PRIMARY KEYWORD: ${primaryKeyword}
CONTENT PREVIEW: ${content.substring(0, 500)}...

META DESCRIPTION REQUIREMENTS:
1. **Length**: 150-160 characters maximum
2. **Keyword**: Include "${primaryKeyword}" naturally
3. **Action-Oriented**: Use verbs like "discover", "learn", "master", "boost"
4. **Benefit-Focused**: What will the reader gain?
5. **Men's Health Voice**: Confident, direct, results-focused
6. **Click-Worthy**: Compelling enough to drive clicks from search results

EXAMPLES:
- "Master ${primaryKeyword} with expert-backed strategies. Boost your results 300% in just weeks."
- "Discover the ${primaryKeyword} secrets top athletes use. Science-based approach that actually works."
- "Transform your ${primaryKeyword} game with these proven techniques. Real results in 30 days."

Return ONLY the meta description text (no quotes or formatting):`

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const metaDescription = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      
      // Ensure it's within limits
      return metaDescription.length <= 160 ? metaDescription : metaDescription.substring(0, 157) + '...'
    } catch (error) {
      console.error('❌ Claude SEO metadata generation failed:', error)
      return `Master ${primaryKeyword} with expert strategies. Science-backed approach for real results.`
    }
  }

  /**
   * Extract primary keyword from title
   */
  private extractPrimaryKeyword(title: string): string {
    const cleanTitle = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    const words = cleanTitle.split(' ')
      .filter(word => word.length > 3)
      .filter(word => !['with', 'from', 'that', 'this', 'they', 'have', 'will', 'been', 'were', 'your', 'what', 'when', 'where', 'how'].includes(word))
    
    return words[0] || 'fitness'
  }

  /**
   * Generate excerpt from content
   */
  private generateExcerpt(content: string): string {
    const text = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    const words = text.split(' ').slice(0, 25)
    return words.join(' ') + (words.length >= 25 ? '...' : '')
  }
} 