interface ContentEnhancementOptions {
  rewriteForOriginality?: boolean
  improveReadability?: boolean
  addHeadings?: boolean
  optimizeForSEO?: boolean
}

interface EnhancedContent {
  title: string
  content: string
  excerpt: string
  readabilityScore: number
  wordCount: number
  warnings: string[]
}

export class ContentEnhancer {
  static async enhanceContent(
    title: string, 
    content: string, 
    options: ContentEnhancementOptions = {}
  ): Promise<EnhancedContent> {
    
    let enhancedTitle = title
    let enhancedContent = content
    const warnings: string[] = []
    
    enhancedContent = this.cleanAndFormatContent(enhancedContent)
    enhancedContent = this.improveParagraphStructure(enhancedContent)
    
    if (options.addHeadings) {
      enhancedContent = this.addStructuredHeadings(enhancedContent)
    }
    
    if (options.rewriteForOriginality) {
      const rewrittenContent = await this.rewriteForOriginality(enhancedTitle, enhancedContent)
      enhancedTitle = rewrittenContent.title
      enhancedContent = rewrittenContent.content
    }
    
    enhancedContent = this.finalFormatting(enhancedContent)
    
    const wordCount = this.getWordCount(enhancedContent)
    const readabilityScore = this.calculateReadabilityScore(enhancedContent)
    const excerpt = this.generateExcerpt(enhancedContent)
    
    if (wordCount < 300) warnings.push('Article is shorter than recommended 300 words')
    if (readabilityScore < 60) warnings.push('Content may be difficult to read')
    
    return {
      title: enhancedTitle,
      content: enhancedContent,
      excerpt,
      readabilityScore,
      wordCount,
      warnings
    }
  }
  
  private static cleanAndFormatContent(content: string): string {
    return content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<\/?[^>]+(>|$)/g, (match) => {
        const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'br', 'a', 'img', 'blockquote']
        const tagName = match.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase()
        return tagName && allowedTags.includes(tagName) ? match : ''
      })
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim()
  }
  
  private static improveParagraphStructure(content: string): string {
    const sentences = content
      .replace(/<[^>]*>/g, ' ')
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 10)
      .map(sentence => sentence.trim())
    
    const paragraphs: string[] = []
    let currentParagraph: string[] = []
    
    sentences.forEach((sentence, index) => {
      currentParagraph.push(sentence)
      
      if (currentParagraph.length >= 3 && (
        currentParagraph.length >= 4 || 
        this.isLogicalBreak(sentence, sentences[index + 1])
      )) {
        // First paragraph gets special treatment as lead paragraph
        if (paragraphs.length === 0) {
          paragraphs.push(`<p class="lead text-xl text-gray-700 mb-8 leading-relaxed">${currentParagraph.join('. ')}.</p>`)
        } else {
          paragraphs.push(`<p class="mb-6 text-gray-700 leading-relaxed">${currentParagraph.join('. ')}.</p>`)
        }
        currentParagraph = []
      }
    })
    
    if (currentParagraph.length > 0) {
      if (paragraphs.length === 0) {
        paragraphs.push(`<p class="lead text-xl text-gray-700 mb-8 leading-relaxed">${currentParagraph.join('. ')}.</p>`)
      } else {
        paragraphs.push(`<p class="mb-6 text-gray-700 leading-relaxed">${currentParagraph.join('. ')}.</p>`)
      }
    }
    
    return paragraphs.join('\n\n')
  }
  
  private static addStructuredHeadings(content: string): string {
    const paragraphs = content.split('</p>')
    const enhancedParagraphs: string[] = []
    let headingLevel = 2 // Start with H2 for main sections
    
    paragraphs.forEach((para, index) => {
      // Add heading every 2-3 paragraphs after the lead
      if (index > 1 && (index - 1) % 3 === 0 && index < paragraphs.length - 1) {
        const headingText = this.generateSEOHeading(para, index)
        const headingTag = headingLevel <= 3 ? `h${headingLevel}` : 'h3'
        enhancedParagraphs.push(`<${headingTag} class="text-2xl font-bold text-gray-900 mt-12 mb-6">${headingText}</${headingTag}>\n\n${para}</p>`)
        
        // Alternate between H2 and H3 for variety
        headingLevel = headingLevel === 2 ? 3 : 2
      } else {
        enhancedParagraphs.push(para + (para.includes('<p') ? '</p>' : ''))
      }
    })
    
    return enhancedParagraphs.join('\n\n')
  }
  
  private static generateSEOHeading(paragraph: string, index: number): string {
    const text = paragraph.replace(/<[^>]*>/g, '').toLowerCase()
    
    // Topic-specific SEO headers
    if (text.includes('workout') || text.includes('exercise') || text.includes('training')) {
      return 'Optimal Workout Strategies for Maximum Results'
    }
    if (text.includes('muscle') || text.includes('strength') || text.includes('build')) {
      return 'Building Lean Muscle Mass: Expert Techniques'
    }
    if (text.includes('cardio') || text.includes('running') || text.includes('heart')) {
      return 'Cardiovascular Training for Peak Performance'
    }
    if (text.includes('protein') || text.includes('diet') || text.includes('nutrition')) {
      return 'Essential Nutrition Guidelines for Success'
    }
    if (text.includes('meal') || text.includes('food') || text.includes('eating')) {
      return 'Strategic Meal Planning for Optimal Health'
    }
    if (text.includes('supplement') || text.includes('vitamin') || text.includes('nutrient')) {
      return 'Smart Supplementation: What Actually Works'
    }
    if (text.includes('sleep') || text.includes('rest') || text.includes('recovery')) {
      return 'Recovery and Rest: The Missing Link'
    }
    if (text.includes('stress') || text.includes('mental') || text.includes('mind')) {
      return 'Mental Health and Wellness Strategies'
    }
    if (text.includes('weight') || text.includes('fat') || text.includes('lose')) {
      return 'Effective Weight Management Techniques'
    }
    if (text.includes('benefit') || text.includes('advantage') || text.includes('positive')) {
      return 'Key Benefits You Need to Know'
    }
    if (text.includes('research') || text.includes('study') || text.includes('science')) {
      return 'What the Science Actually Says'
    }
    if (text.includes('tip') || text.includes('advice') || text.includes('recommend')) {
      return 'Expert Tips for Better Results'
    }
    
    // SEO-optimized generic headers based on position
    const seoHeadings = [
      'Understanding the Fundamentals',
      'Advanced Strategies That Work',
      'Common Mistakes to Avoid',
      'Maximizing Your Results',
      'Expert Recommendations',
      'Taking Action: Next Steps',
      'Long-Term Success Strategies',
      'The Science Behind the Method',
      'Real-World Implementation',
      'Troubleshooting Common Issues'
    ]
    
    return seoHeadings[index % seoHeadings.length]
  }
  
  private static async rewriteForOriginality(title: string, content: string): Promise<{title: string, content: string}> {
    const sentences = content
      .replace(/<[^>]*>/g, ' ')
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 10)
    
    const rewrittenSentences = sentences.map(sentence => {
      return this.rewriteSentence(sentence.trim())
    }).filter(s => s.length > 0)
    
    const rewrittenTitle = this.rewriteTitle(title)
    const rewrittenContent = this.reconstructContent(rewrittenSentences)
    
    return {
      title: rewrittenTitle,
      content: rewrittenContent
    }
  }
  
  private static rewriteSentence(sentence: string): string {
    const synonymMap: Record<string, string[]> = {
      'exercise': ['workout', 'physical activity', 'training', 'fitness routine'],
      'workout': ['exercise session', 'training routine', 'fitness regimen', 'physical activity'],
      'muscle': ['muscular tissue', 'muscle fibers', 'lean mass', 'muscular strength'],
      'protein': ['amino acids', 'protein compounds', 'essential proteins', 'protein nutrients'],
      'healthy': ['beneficial', 'nutritious', 'wholesome', 'advantageous'],
      'important': ['crucial', 'essential', 'vital', 'significant'],
      'effective': ['successful', 'efficient', 'powerful', 'productive'],
      'build': ['develop', 'create', 'establish', 'construct'],
      'improve': ['enhance', 'boost', 'strengthen', 'optimize'],
      'increase': ['boost', 'elevate', 'raise', 'enhance'],
      'reduce': ['decrease', 'lower', 'minimize', 'diminish'],
      'help': ['assist', 'support', 'aid', 'contribute to'],
      'benefits': ['advantages', 'positive effects', 'gains', 'rewards'],
      'results': ['outcomes', 'effects', 'consequences', 'achievements']
    }
    
    let rewritten = sentence
    
    Object.entries(synonymMap).forEach(([original, synonyms]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi')
      if (regex.test(rewritten)) {
        const synonym = synonyms[Math.floor(Math.random() * synonyms.length)]
        rewritten = rewritten.replace(regex, synonym)
      }
    })
    
    rewritten = this.restructureSentence(rewritten)
    return rewritten
  }
  
  private static restructureSentence(sentence: string): string {
    sentence = sentence.replace(/(\w+) is (\w+) by/, 'The $2 $1s')
    
    if (sentence.includes(' and ')) {
      const parts = sentence.split(' and ')
      if (parts.length === 2) {
        if (Math.random() > 0.5) {
          sentence = `${parts[1].trim()}, and ${parts[0].trim()}`
        }
      }
    }
    
    const transitions = [
      'Furthermore, ',
      'Additionally, ',
      'Moreover, ',
      'In addition, ',
      'It\'s worth noting that ',
      'Research shows that ',
      'Studies indicate that '
    ]
    
    if (Math.random() > 0.7 && !sentence.match(/^(Furthermore|Additionally|Moreover|In addition|It's worth|Research|Studies)/)) {
      const transition = transitions[Math.floor(Math.random() * transitions.length)]
      sentence = transition + sentence.charAt(0).toLowerCase() + sentence.slice(1)
    }
    
    return sentence
  }
  
  private static rewriteTitle(title: string): string {
    const titlePatterns = [
      'The Ultimate Guide to {topic}',
      'Everything You Need to Know About {topic}',
      'Mastering {topic}: A Complete Guide',
      '{topic}: The Complete Breakdown',
      'Your Complete Guide to {topic}',
      'The Science Behind {topic}',
      'Unlocking the Secrets of {topic}',
      'Transform Your {topic} Journey'
    ]
    
    const cleanTitle = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 3)
      .join(' ')
    
    if (Math.random() > 0.7) {
      const pattern = titlePatterns[Math.floor(Math.random() * titlePatterns.length)]
      return pattern.replace('{topic}', cleanTitle)
    }
    
    return this.rewriteSentence(title)
  }
  
  private static reconstructContent(sentences: string[]): string {
    const paragraphs: string[] = []
    let currentParagraph: string[] = []
    
    sentences.forEach((sentence, index) => {
      currentParagraph.push(sentence)
      
      if (currentParagraph.length >= 2 && (
        currentParagraph.length >= 4 || 
        Math.random() > 0.6 ||
        index === sentences.length - 1
      )) {
        paragraphs.push(`<p>${currentParagraph.join('. ')}.</p>`)
        currentParagraph = []
      }
    })
    
    return paragraphs.join('\n\n')
  }
  
  private static finalFormatting(content: string): string {
    return content
      .replace(/<\/p>\s*<p>/g, '</p>\n\n<p>')
      .replace(/<\/h[1-6]>\s*<p>/g, (match) => match.replace('><p>', '>\n\n<p>'))
      .replace(/<\/p>\s*<h[1-6]>/g, (match) => match.replace('></h', '>\n\n<h'))
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }
  
  private static isLogicalBreak(current: string, next?: string): boolean {
    if (!next) return true
    const breakWords = ['however', 'therefore', 'meanwhile', 'furthermore', 'additionally', 'moreover']
    return breakWords.some(word => next.toLowerCase().includes(word))
  }
  
  private static getWordCount(content: string): number {
    return content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 0).length
  }
  
  private static calculateReadabilityScore(content: string): number {
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ')
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = text.split(' ').filter(w => w.length > 0)
    const avgWordsPerSentence = words.length / sentences.length
    
    const score = Math.max(0, 100 - (avgWordsPerSentence * 2))
    return Math.round(score)
  }
  
  private static generateExcerpt(content: string): string {
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const words = text.split(' ').slice(0, 30)
    return words.join(' ') + (words.length >= 30 ? '...' : '')
  }
}
