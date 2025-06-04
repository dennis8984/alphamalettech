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
    const cleanTitle = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Extract key topic words for SEO keywords
    const topicWords = cleanTitle.split(' ')
      .filter(word => word.length > 3)
      .filter(word => !['with', 'from', 'that', 'this', 'they', 'have', 'will', 'been', 'were', 'said', 'what', 'when', 'where', 'how'].includes(word))
      .slice(0, 3)
    
    const primaryKeyword = topicWords[0] || 'health'
    const secondaryKeywords = topicWords.slice(1).join(' ')
    
    // Men's Health headline patterns following editorial guidelines
    const headlinePatterns = [
      // How-to patterns (instructional)
      {
        pattern: `How to ${this.getActionVerb()} ${primaryKeyword} ${secondaryKeywords}`.trim(),
        category: 'instructional'
      },
      {
        pattern: `How to ${this.getActionVerb()} Your ${primaryKeyword} in 30 Days`,
        category: 'instructional'
      },
      
      // Curiosity patterns
      {
        pattern: `Why ${primaryKeyword} ${this.getPowerAdjective()} Your Health`,
        category: 'curiosity'
      },
      {
        pattern: `What Happens When You ${this.getActionVerb()} ${primaryKeyword}`,
        category: 'curiosity'
      },
      
      // Numbered list patterns
      {
        pattern: `${this.getRandomNumber()} ${this.getPowerAdjective()} ${primaryKeyword} ${this.getListWord()}`,
        category: 'numbered'
      },
      {
        pattern: `${this.getRandomNumber()} Ways to ${this.getActionVerb()} Your ${primaryKeyword}`,
        category: 'numbered'
      },
      
      // Authority patterns
      {
        pattern: `The Ultimate Guide to ${primaryKeyword} ${secondaryKeywords}`.trim(),
        category: 'authority'
      },
      {
        pattern: `The Truth About ${primaryKeyword} ${this.getPowerAdjective()} Results`,
        category: 'authority'
      },
      {
        pattern: `The Definitive Guide to ${this.getActionVerb()} ${primaryKeyword}`,
        category: 'authority'
      },
      
      // First-person hook patterns
      {
        pattern: `I ${this.getFirstPersonAction()} ${primaryKeyword} for 30 Days—Here's What Happened`,
        category: 'personal'
      },
      {
        pattern: `I Tried ${primaryKeyword} ${secondaryKeywords} and the Results ${this.getPowerAdjective()} Me`.trim(),
        category: 'personal'
      }
    ]
    
    // Select a random pattern and format it properly
    const selectedPattern = headlinePatterns[Math.floor(Math.random() * headlinePatterns.length)]
    let headline = selectedPattern.pattern
    
    // Clean up and format to Title Case
    headline = headline
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map((word, index) => {
        // Don't capitalize small connecting words (unless they're the first word)
        if (index > 0 && ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'].includes(word.toLowerCase())) {
          return word.toLowerCase()
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join(' ')
    
    // Ensure it's within 6-13 words
    const wordCount = headline.split(' ').length
    if (wordCount > 13) {
      headline = headline.split(' ').slice(0, 13).join(' ')
    } else if (wordCount < 6) {
      headline = `The Complete Guide to ${headline}`
    }
    
    return headline
  }
  
  // Helper methods for generating dynamic headline components
  private static getActionVerb(): string {
    const verbs = [
      'Master', 'Transform', 'Boost', 'Optimize', 'Maximize', 'Build', 'Crush', 'Unlock', 
      'Supercharge', 'Enhance', 'Perfect', 'Dominate', 'Accelerate', 'Revolutionize'
    ]
    return verbs[Math.floor(Math.random() * verbs.length)]
  }
  
  private static getPowerAdjective(): string {
    const adjectives = [
      'Ultimate', 'Proven', 'Surprising', 'Game-Changing', 'Essential', 'Advanced', 
      'Secret', 'Powerful', 'Revolutionary', 'Expert', 'Professional', 'Cutting-Edge'
    ]
    return adjectives[Math.floor(Math.random() * adjectives.length)]
  }
  
  private static getListWord(): string {
    const listWords = [
      'Tips', 'Strategies', 'Methods', 'Techniques', 'Steps', 'Ways', 'Secrets', 
      'Rules', 'Hacks', 'Moves', 'Tactics', 'Principles'
    ]
    return listWords[Math.floor(Math.random() * listWords.length)]
  }
  
  private static getRandomNumber(): string {
    const numbers = ['5', '7', '10', '12', '15', '8', '6', '9']
    return numbers[Math.floor(Math.random() * numbers.length)]
  }
  
  private static getFirstPersonAction(): string {
    const actions = [
      'Tested', 'Tried', 'Used', 'Followed', 'Tracked', 'Experimented with', 
      'Committed to', 'Stuck with', 'Dedicated Myself to'
    ]
    return actions[Math.floor(Math.random() * actions.length)]
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
