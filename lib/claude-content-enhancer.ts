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
  private lastMetaDescription: string | undefined
  
  constructor() {
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY environment variable is required')
    }
    
    this.claude = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    })
  }

  /**
   * Get category context based on primary keyword
   */
  private getCategoryContext(primaryKeyword: string): string {
    const keyword = primaryKeyword.toLowerCase()
    
    if (keyword.includes('fitness') || keyword.includes('exercise') || keyword.includes('workout')) {
      return 'Fitness'
    } else if (keyword.includes('nutrition') || keyword.includes('diet') || keyword.includes('food')) {
      return 'Nutrition'
    } else if (keyword.includes('weight') || keyword.includes('loss') || keyword.includes('fat')) {
      return 'Weight Loss'
    } else if (keyword.includes('muscle') || keyword.includes('strength') || keyword.includes('building')) {
      return 'Muscle Building'
    } else if (keyword.includes('health') || keyword.includes('wellness') || keyword.includes('medical')) {
      return 'Health'
    } else {
      return 'Health & Fitness'
    }
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

      // Step 4: Generate SEO metadata (use stored meta description if available)
      if (options.optimizeForSEO) {
        console.log('🔍 Optimizing SEO metadata with Claude...')
        metaDescription = this.lastMetaDescription || await this.generateSEOMetadata(enhancedTitle, enhancedContent, primaryKeyword)
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
    
    const prompt = `You are a health and fitness content writer. Rewrite the given article to be unique while maintaining accuracy.

Focus on:
1) Using different sentence structures
2) Adding relevant examples
3) Reorganizing information logically
4) Maintaining factual accuracy
5) Creating engaging, reader-friendly content
6) Preserving the key health and fitness information
7) IMPORTANT: The rewritten article must be approximately the same length as the original (${content.split(' ').length} words)
8) PRESERVE ALL IMAGE TAGS (<img>) exactly as they appear in the original
9) Replace any mentions of "Men's Health" with "Men's Hub"

Article Information:
- Original Title: ${title}
- Category: ${this.getCategoryContext(primaryKeyword)}
- Primary Keyword: ${primaryKeyword}
- Content Length: ${content.split(' ').length} words

Content to Rewrite:
${content}

CRITICAL INSTRUCTIONS:
- Do NOT include any meta-commentary like "Here is the rewritten article" or "I've added headings"
- Return ONLY valid JSON
- The content field should contain ONLY the article content, no explanations
- Maintain the full length of the original article

Return your response as valid JSON with exactly these three fields:
- "title": The rewritten article title (make it compelling and SEO-friendly)
- "content": The rewritten article content (in HTML format with <p>, <h2>, <h3> tags for structure)
- "meta_description": A 150-160 character meta description based on the rewritten content`

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-opus-20240229',
        temperature: 0.7,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })

      const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
      const parsedResponse = JSON.parse(responseText)
      
      // Store meta_description if provided
      if (parsedResponse.meta_description) {
        this.lastMetaDescription = parsedResponse.meta_description
      }
      
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
    const prompt = `Improve the readability of this health and fitness article:

CONTENT: ${content}

IMPROVEMENTS NEEDED:
1. **Sentence Variety**: Mix short and long sentences for better flow
2. **Paragraph Structure**: Keep paragraphs 3-5 sentences max
3. **Active Voice**: Use active voice for clarity
4. **Plain Language**: Replace jargon with simpler terms where appropriate
5. **Transitions**: Add smooth transitions between sections
6. **Keyword Integration**: Ensure "${primaryKeyword}" appears naturally 3-5 times

MAINTAIN:
- All factual health information
- Scientific accuracy
- HTML formatting and structure
- Professional tone

CRITICAL: Return ONLY the improved content without any meta-commentary or explanations. Do NOT include phrases like "Here is the improved content" or any other commentary. Start directly with the article content:`

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-opus-20240229',
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
    const prompt = `Add strategic H2 headings to this health and fitness article:

CONTENT: ${content}

HEADING REQUIREMENTS:
1. **H2 Every 200-300 words**: Break up content into digestible sections
2. **SEO Friendly**: Include "${primaryKeyword}" naturally in 1-2 headings
3. **Clear & Informative**: Headings should clearly indicate section content
4. **Question Format**: Use some questions to engage readers
5. **Benefit-Focused**: Highlight what readers will learn or gain

HEADING EXAMPLES:
- "What Is ${primaryKeyword} and Why Does It Matter?"
- "The Health Benefits of [Topic]"
- "How to Get Started With [Topic]"
- "Common Mistakes to Avoid"
- "Tips for Long-Term Success"
- "Frequently Asked Questions About [Topic]"

Add H2 headings with this HTML format:
<h2>Heading Text</h2>

CRITICAL: Return ONLY the complete content with headings added. Do NOT include any meta-commentary like "Here is the article with strategic H2 headings added" or any explanations. Start directly with the article content:`

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-opus-20240229',
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
    const prompt = `Create an SEO-optimized meta description for this health and fitness article:

TITLE: ${title}
PRIMARY KEYWORD: ${primaryKeyword}
CONTENT PREVIEW: ${content.substring(0, 500)}...

META DESCRIPTION REQUIREMENTS:
1. **Length**: 150-160 characters maximum
2. **Keyword**: Include "${primaryKeyword}" naturally
3. **Value Proposition**: Clearly state what readers will learn
4. **Call to Action**: Encourage clicks with action words
5. **Accuracy**: Reflect actual article content
6. **Unique**: Don't duplicate the title

EXAMPLES:
- "Learn how ${primaryKeyword} can improve your health. Expert tips, scientific research, and practical advice for real results."
- "Discover the benefits of ${primaryKeyword} with our comprehensive guide. Evidence-based strategies for better health."
- "Everything you need to know about ${primaryKeyword}. Get expert insights and actionable tips to improve your wellness."

Return ONLY the meta description text (no quotes or formatting):`

    try {
      const response = await this.claude.messages.create({
        model: 'claude-3-opus-20240229',
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