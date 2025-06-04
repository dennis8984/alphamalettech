interface ContentEnhancementOptions {
  rewriteForOriginality?: boolean
  improveReadability?: boolean
  addHeadings?: boolean
  optimizeForSEO?: boolean
  primaryKeyword?: string
}

interface EnhancedContent {
  title: string
  content: string
  excerpt: string
  readabilityScore: number
  wordCount: number
  warnings: string[]
  metaDescription?: string
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
    
    // Extract primary keyword from title
    const primaryKeyword = options.primaryKeyword || this.extractPrimaryKeyword(title)
    
    enhancedContent = this.cleanAndFormatContent(enhancedContent)
    
    if (options.rewriteForOriginality) {
      const rewrittenContent = await this.rewriteForOriginality(enhancedTitle, enhancedContent)
      enhancedTitle = rewrittenContent.title
      enhancedContent = rewrittenContent.content
    } else {
      enhancedContent = this.applyMensHealthFormatting(enhancedContent, primaryKeyword)
    }
    
    const wordCount = this.getWordCount(enhancedContent)
    const readabilityScore = this.calculateReadabilityScore(enhancedContent)
    const excerpt = this.generateExcerpt(enhancedContent)
    const metaDescription = this.generateMetaDescription(enhancedTitle, primaryKeyword, excerpt)
    
    if (wordCount < 500) warnings.push('Article is shorter than recommended 500 words for Men\'s Health standards')
    if (readabilityScore < 70) warnings.push('Content may be difficult to read - aim for 70+ readability score')
    
    return {
      title: enhancedTitle,
      content: enhancedContent,
      excerpt,
      readabilityScore,
      wordCount,
      warnings,
      metaDescription
    }
  }
  
  private static extractPrimaryKeyword(title: string): string {
    const cleanTitle = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    const words = cleanTitle.split(' ')
      .filter(word => word.length > 3)
      .filter(word => !['with', 'from', 'that', 'this', 'they', 'have', 'will', 'been', 'were', 'your', 'what', 'when', 'where', 'how'].includes(word))
    
    return words[0] || 'fitness'
  }
  
  private static async rewriteForOriginality(title: string, content: string): Promise<{title: string, content: string}> {
    const sentences = content
      .replace(/<[^>]*>/g, ' ')
      .split(/[.!?]+/)
      .filter(s => s.trim().length > 10)
      .map(s => s.trim())
    
    if (sentences.length < 5) {
      // Not enough content for full Men's Health treatment
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
    
    // Extract primary keyword from title
    const primaryKeyword = this.extractPrimaryKeyword(title)
    
    // Generate Men's Health style structure
    const rewrittenTitle = this.rewriteTitle(title)
    const mensHealthContent = this.generateMensHealthStructure(sentences, primaryKeyword)
    
    return {
      title: rewrittenTitle,
      content: mensHealthContent
    }
  }
  
  private static generateMensHealthStructure(sentences: string[], primaryKeyword: string): string {
    // Generate hook lede (2 sentences, first may be ALL-CAPS)
    const hookLede = this.generateHookLede(sentences)
    
    // Generate Quick Takeaways box
    const quickTakeaways = this.generateQuickTakeaways(primaryKeyword)
    
    // Process body content with Men's Health structure
    const bodyContent = this.generateMensHealthBody(sentences, primaryKeyword)
    
    return `${hookLede}

${quickTakeaways}

${bodyContent}`
  }
  
  private static generateHookLede(sentences: string[]): string {
    const capsOptions = [
      "YOUR FITNESS GAME IS ABOUT TO CHANGE.",
      "THIS CHANGES EVERYTHING.",
      "YOU'VE BEEN DOING IT WRONG.",
      "THE GAME HAS CHANGED.",
      "THIS IS A GAME-CHANGER.",
      "EVERYTHING YOU KNOW IS WRONG.",
      "THE SECRET IS OUT."
    ]
    
    const firstSentence = Math.random() > 0.6 ? 
      capsOptions[Math.floor(Math.random() * capsOptions.length)] : 
      this.enhanceSentenceForSecondPerson(sentences[0] || "Your approach to health is about to transform.")
    
    const secondSentence = this.enhanceSentenceForSecondPerson(
      sentences[1] || "Here's everything you need to know to get results that actually last."
    )
    
    return `<p class="lead text-xl text-gray-700 mb-8 leading-relaxed">${firstSentence} ${secondSentence}</p>`
  }
  
  private static generateQuickTakeaways(primaryKeyword: string): string {
    const takeaways = [
      `${primaryKeyword} can transform your health in ways you never imagined`,
      `The right approach makes all the difference between success and failure`,
      `Expert-backed strategies deliver results faster than DIY methods`,
      `Small changes compound into massive improvements over time`,
      `Consistency beats perfection every single time`,
      `Most people quit too early—the real results come after week 3`,
      `Science shows that ${primaryKeyword} works best with a systematic approach`
    ]
    
    const selectedTakeaways = takeaways
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.random() > 0.5 ? 4 : 5)
    
    return `<div class="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
  <h3 class="text-lg font-bold text-red-900 mb-3">Quick Takeaways</h3>
  <ul class="space-y-2 text-red-800">
${selectedTakeaways.map(takeaway => `    <li class="flex items-start"><span class="text-red-600 mr-2">•</span>${takeaway}</li>`).join('\n')}
  </ul>
</div>`
  }
  
  private static generateMensHealthBody(sentences: string[], primaryKeyword: string): string {
    const sections: string[] = []
    let currentSection: string[] = []
    let wordCount = 0
    const targetWordsPerSection = 200
    
    // Generate strategic H2 headings
    const h2Headings = this.generateStrategicH2s(primaryKeyword)
    let headingIndex = 0
    
    sentences.forEach((sentence, index) => {
      const enhancedSentence = this.enhanceSentenceForSecondPerson(sentence)
      currentSection.push(enhancedSentence)
      wordCount += enhancedSentence.split(' ').length
      
      // Create new section every 150-250 words or at logical breaks
      if (wordCount >= targetWordsPerSection || index === sentences.length - 1) {
        if (currentSection.length > 0) {
          const heading = h2Headings[headingIndex % h2Headings.length]
          const sectionContent = this.formatSectionContent(currentSection, headingIndex, primaryKeyword)
          sections.push(`<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6">${heading}</h2>\n\n${sectionContent}`)
          headingIndex++
        }
        currentSection = []
        wordCount = 0
      }
    })
    
    return sections.join('\n\n')
  }
  
  private static generateStrategicH2s(primaryKeyword: string): string[] {
    return [
      `Why ${primaryKeyword} Works Better Than You Think`,
      `The Science Behind ${primaryKeyword} Success`,
      `Expert-Approved ${primaryKeyword} Strategies`,
      `Common ${primaryKeyword} Mistakes to Avoid`,
      `Advanced ${primaryKeyword} Techniques That Work`,
      `How to Maximize Your ${primaryKeyword} Results`,
      `The Future of ${primaryKeyword} Training`,
      `Building Long-Term ${primaryKeyword} Success`
    ]
  }
  
  private static formatSectionContent(sentences: string[], sectionIndex: number, primaryKeyword: string): string {
    // Break into short paragraphs (1-3 sentences)
    const paragraphs = this.createShortParagraphs(sentences)
    let content = paragraphs.map(para => `<p class="mb-6 text-gray-700 leading-relaxed">${para}</p>`).join('\n\n')
    
    // Add special content elements based on section
    if (sectionIndex === 1) {
      // Add expert quote in second section
      content += `\n\n${this.generateExpertQuote(primaryKeyword)}`
    } else if (sectionIndex === 2) {
      // Add action list in third section
      content += `\n\n${this.generateActionList(primaryKeyword)}`
    } else if (sectionIndex === 3) {
      // Add CTA call-out
      content += `\n\n${this.generateCTACallout()}`
    }
    
    // Add image placeholder occasionally
    if (Math.random() > 0.7) {
      content += `\n\n${this.generateImagePlaceholder(primaryKeyword)}`
    }
    
    return content
  }
  
  private static createShortParagraphs(sentences: string[]): string[] {
    const paragraphs: string[] = []
    let currentParagraph: string[] = []
    
    sentences.forEach((sentence, index) => {
      currentParagraph.push(sentence)
      
      // Create paragraph every 1-3 sentences
      if (currentParagraph.length >= Math.floor(Math.random() * 3) + 1 || index === sentences.length - 1) {
        paragraphs.push(currentParagraph.join(' '))
        currentParagraph = []
      }
    })
    
    return paragraphs
  }
  
  private static generateExpertQuote(primaryKeyword: string): string {
    const experts = [
      { name: "Dr. Sarah Johnson", credential: "Exercise Physiologist" },
      { name: "Michael Chen", credential: "Certified Strength Coach" },
      { name: "Dr. Amanda Rodriguez", credential: "Sports Nutritionist" },
      { name: "James Thompson", credential: "Performance Specialist" },
      { name: "Dr. Kevin Martinez", credential: "Sports Medicine Physician" }
    ]
    
    const expert = experts[Math.floor(Math.random() * experts.length)]
    
    const quotes = [
      `The key to ${primaryKeyword} success is consistency over intensity. Most people try to do too much too fast.`,
      `What we see in the research is that ${primaryKeyword} works best when it's part of a comprehensive approach.`,
      `The biggest mistake I see is people neglecting the fundamentals of ${primaryKeyword} training.`,
      `Every client I work with sees better results when they focus on quality over quantity with ${primaryKeyword}.`,
      `The science is clear: ${primaryKeyword} delivers results when you follow evidence-based protocols.`
    ]
    
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    
    return `<blockquote class="border-l-4 border-red-600 pl-6 my-8 bg-gray-50 py-4">
  <p class="text-lg italic text-gray-700 mb-2">"${quote}"</p>
  <footer class="text-gray-600">— <strong>${expert.name}, ${expert.credential}</strong></footer>
</blockquote>`
  }
  
  private static generateActionList(primaryKeyword: string): string {
    const actions = [
      `Start with proper form over heavy weight`,
      `Track your progress consistently every week`,
      `Focus on compound movements first`,
      `Allow adequate recovery time between sessions`,
      `Gradually increase intensity over time`,
      `Stay consistent with your routine for at least 8 weeks`,
      `Listen to your body and adjust accordingly`
    ]
    
    const selectedActions = actions.slice(0, Math.floor(Math.random() * 3) + 4)
    
    return `<div class="bg-gray-100 p-6 rounded-lg my-8">
  <h3 class="text-lg font-bold text-gray-900 mb-4">${primaryKeyword} Action Steps:</h3>
  <ol class="space-y-2 text-gray-700">
${selectedActions.map((action, index) => `    <li class="flex items-start"><span class="font-bold text-red-600 mr-2">${index + 1}.</span>${action}</li>`).join('\n')}
  </ol>
</div>`
  }
  
  private static generateCTACallout(): string {
    const callouts = [
      {
        title: "Quick Tip",
        content: "Start small and build momentum. Consistency beats perfection every time."
      },
      {
        title: "READ MORE",
        content: "Ready to take your training to the next level? The science says this one change makes all the difference."
      },
      {
        title: "Pro Tip",
        content: "The best time to start is now. Your future self will thank you."
      },
      {
        title: "Expert Insight",
        content: "Most people quit too early. The real results come after the first month."
      }
    ]
    
    const callout = callouts[Math.floor(Math.random() * callouts.length)]
    
    return `<div class="bg-red-600 text-white p-6 rounded-lg my-8">
  <h3 class="text-lg font-bold mb-2">${callout.title}</h3>
  <p>${callout.content}</p>
</div>`
  }
  
  private static generateImagePlaceholder(primaryKeyword: string): string {
    return `<figure class="my-8">
  <img src="{IMAGE_URL}" alt="Man demonstrating proper ${primaryKeyword} technique in gym" class="w-full rounded-lg">
  <figcaption class="text-center text-gray-600 text-sm mt-2">Proper form is essential for maximizing ${primaryKeyword} results.</figcaption>
</figure>`
  }
  
  private static enhanceSentenceForSecondPerson(sentence: string): string {
    // Convert to second-person voice and active verbs
    let enhanced = sentence
      .replace(/\b(people|individuals|one|someone)\b/gi, 'you')
      .replace(/\b(they|them)\b/gi, 'you')
      .replace(/\b(is done|can be done|should be done)\b/gi, 'you should do')
      .replace(/\b(it's important|it is important)\b/gi, 'you need')
      .replace(/\b(research shows|studies show)\b/gi, 'research shows that you')
    
    // Add power words occasionally
    if (Math.random() > 0.8) {
      const powerWords = ['proven', 'essential', 'crucial', 'game-changing', 'powerful']
      const powerWord = powerWords[Math.floor(Math.random() * powerWords.length)]
      enhanced = enhanced.replace(/\b(important|good|effective)\b/gi, powerWord)
    }
    
    return enhanced
  }
  
  private static generateMetaDescription(title: string, primaryKeyword: string, excerpt: string): string {
    const benefit = this.getBenefit()
    const template = `Master ${primaryKeyword} with expert-backed strategies. ${benefit} in just weeks. Science-based approach that actually works.`
    
    return template.length <= 160 ? template : excerpt.substring(0, 157) + '...'
  }
  
  // Helper methods for content generation
  private static getBenefit(): string {
    const benefits = [
      'Transform your physique', 'Boost your confidence', 'Improve your health', 
      'Increase your strength', 'Enhance your performance', 'Build lean muscle',
      'Burn more fat', 'Feel more energetic'
    ]
    return benefits[Math.floor(Math.random() * benefits.length)]
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
  
  private static applyMensHealthFormatting(content: string, primaryKeyword: string): string {
    // Implementation of applyMensHealthFormatting method
    return content
  }
  
  // Helper methods for Men's Health content generation
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
}
