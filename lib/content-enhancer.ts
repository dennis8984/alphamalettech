import { ImageService } from './image-service';
import { AuthorityLinkDetector } from './authority-link-detector';
import { InternalLinkOptimizer } from './internal-link-optimizer';
import { ClaudeContentEnhancer } from './claude-content-enhancer';
import { getAllArticles } from './articles-db';

interface ContentEnhancementOptions {
  rewriteForOriginality?: boolean
  improveReadability?: boolean
  addHeadings?: boolean
  optimizeForSEO?: boolean
  primaryKeyword?: string
  replaceImages?: boolean
  addAuthorityLinks?: boolean
  addInternalLinks?: boolean
  articleSlug?: string
  category?: string
  useClaude?: boolean
}

interface EnhancedContent {
  title: string
  content: string
  excerpt: string
  readabilityScore: number
  wordCount: number
  warnings: string[]
  metaDescription?: string
  imageReplacements?: number
  authorityLinksAdded?: number
  internalLinksAdded?: number
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
    let imageReplacements = 0
    let authorityLinksAdded = 0
    let internalLinksAdded = 0
    let metaDescription: string | undefined
    
    console.log('🚀 Starting comprehensive content enhancement...')
    
    // Extract primary keyword from title
    const primaryKeyword = options.primaryKeyword || this.extractPrimaryKeyword(title)
    
    // Use Claude AI if enabled and API key is available
    if (options.useClaude && process.env.CLAUDE_API_KEY) {
      console.log('🤖 Using Claude AI for content enhancement...')
      try {
        const claudeEnhancer = new ClaudeContentEnhancer()
        const claudeResult = await claudeEnhancer.enhanceContent(title, content, {
          rewriteForOriginality: options.rewriteForOriginality,
          improveReadability: options.improveReadability,
          addHeadings: options.addHeadings,
          optimizeForSEO: options.optimizeForSEO,
          primaryKeyword: primaryKeyword
        })
        
        enhancedTitle = claudeResult.title
        enhancedContent = claudeResult.content
        metaDescription = claudeResult.metaDescription
        warnings.push(...claudeResult.warnings)
        
        console.log('✅ Claude AI enhancement complete!')
      } catch (error) {
        console.error('🚨 Claude AI failed, falling back to manual enhancement:', error)
        warnings.push(`Claude AI unavailable, using manual enhancement: ${error}`)
      }
    } else if (options.useClaude) {
      warnings.push('Claude AI requested but CLAUDE_API_KEY not configured, using manual enhancement')
    }
    
    // If not using Claude or Claude failed, use manual enhancement methods
    if (!options.useClaude || warnings.some(w => w.includes('Claude AI'))) {
      // Step 1: Rewrite for originality (if enabled and not done by Claude)
      if (options.rewriteForOriginality && !enhancedContent.includes('<div class="bg-red-50')) {
        console.log('✍️ Rewriting content for originality...')
        const rewrittenContent = await this.rewriteForOriginality(enhancedTitle, enhancedContent)
        enhancedTitle = rewrittenContent.title
        enhancedContent = rewrittenContent.content
      }

      // Step 2: Improve readability and structure (if enabled and not done by Claude)
      if (options.improveReadability && !enhancedContent.includes('class="lead')) {
        enhancedContent = this.improveReadability(enhancedContent)
      }

      // Step 3: Add headings (if enabled and not done by Claude)
      if (options.addHeadings && !enhancedContent.includes('<h2')) {
        enhancedContent = this.addHeadings(enhancedContent, primaryKeyword)
      }
    }

    // These steps always run after content rewriting
    
    // Step 4: Replace image placeholders (if enabled)
    if (options.replaceImages) {
      console.log('🖼️ Replacing image placeholders...')
      try {
        const originalPlaceholders = (enhancedContent.match(/\{IMAGE_URL\}/g) || []).length
        console.log(`📊 Found ${originalPlaceholders} image placeholders to replace`)
        
        // Determine category from options or infer from primaryKeyword
        const category = options.category || this.inferCategoryFromKeyword(primaryKeyword)
        console.log(`🏷️ Using category: "${category}" for contextual images`)
        
        enhancedContent = await ImageService.replaceImagePlaceholders(
          enhancedContent, 
          enhancedTitle, 
          category
        )
        imageReplacements = originalPlaceholders
        console.log(`✅ Replaced ${imageReplacements} images with contextual search`)
      } catch (error) {
        console.error('🚨 Image replacement failed:', error)
        warnings.push('Image replacement failed - using fallback images')
      }
    }

    // Step 5: Add authority links (if enabled)
    if (options.addAuthorityLinks) {
      console.log('🔗 Adding authority links...')
      try {
        const authorityResult = await AuthorityLinkDetector.detectAndLinkAuthorities(enhancedContent)
        enhancedContent = authorityResult.linkedText
        authorityLinksAdded = authorityResult.linksAdded.length
        console.log(`✅ Added ${authorityLinksAdded} authority links`)
      } catch (error) {
        console.error('🚨 Authority linking failed:', error)
        warnings.push('Authority link detection failed')
      }
    }

    // Step 6: Add internal links (if enabled)
    if (options.addInternalLinks && options.articleSlug) {
      console.log('🔗 Adding internal links...')
      try {
        const internalResult = await InternalLinkOptimizer.optimizeInternalLinks(
          enhancedContent, 
          options.articleSlug, 
          2
        )
        enhancedContent = internalResult.linkedText
        internalLinksAdded = internalResult.linksAdded.length
        console.log(`✅ Added ${internalLinksAdded} internal links`)
      } catch (error) {
        console.error('🚨 Internal linking failed:', error)
        warnings.push('Internal link optimization failed')
      }
    }

    // Step 7: Detect and separate teaser content (new functionality)
    console.log('🔍 Detecting subject changes and converting teasers...')
    try {
      enhancedContent = await this.detectAndConvertTeasers(enhancedContent, enhancedTitle, options.category || 'health')
      console.log('✅ Converted off-topic content to article teasers')
    } catch (error) {
      console.error('🚨 Teaser detection failed:', error)
      warnings.push('Teaser detection failed')
    }

    // Calculate metrics
    const wordCount = this.getWordCount(enhancedContent)
    const readabilityScore = this.calculateReadabilityScore(enhancedContent)
    
    // Generate meta description if not already generated by Claude
    if (options.optimizeForSEO && !metaDescription) {
      metaDescription = this.generateMetaDescription(enhancedTitle, enhancedContent, primaryKeyword)
    }

    console.log(`✅ Content enhancement complete!`)
    console.log(`📊 Stats: ${wordCount} words, ${imageReplacements} images, ${authorityLinksAdded} authority links, ${internalLinksAdded} internal links`)

    return {
      title: enhancedTitle,
      content: enhancedContent,
      excerpt: this.generateExcerpt(enhancedContent, 160),
      readabilityScore,
      wordCount,
      warnings,
      metaDescription,
      imageReplacements,
      authorityLinksAdded,
      internalLinksAdded
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
    // Apply the proven Men's Health editorial structure
    console.log('🎯 Applying impactful Men\'s Health editorial structure...')
    
    // Generate LSI synonyms for the primary keyword
    const lsiSynonyms = this.generateLSISynonyms(primaryKeyword)
    
    // Create the hook lede (2 sentences, first may be ALL-CAPS)
    const hookLede = this.createImpactfulLede(sentences)
    
    // Generate Quick Takeaways box (3-5 bullet points)
    const quickTakeaways = this.createQuickTakeawaysBox(primaryKeyword)
    
    // Create body sections with H2s every 150-250 words
    const bodySections = this.createMensHealthBodySections(sentences, primaryKeyword, lsiSynonyms)
    
    return `${hookLede}

${quickTakeaways}

${bodySections}`
  }
  
  private static createImpactfulLede(sentences: string[]): string {
    // ALL-CAPS attention grabbers for first sentence
    const allCapsHooks = [
      "YOUR FITNESS GAME IS ABOUT TO CHANGE.",
      "THIS CHANGES EVERYTHING YOU KNOW ABOUT HEALTH.",
      "YOU'VE BEEN DOING IT WRONG—HERE'S WHY.",
      "THE GAME HAS CHANGED, AND SO SHOULD YOU.",
      "THIS ONE DISCOVERY WILL SHOCK YOU.",
      "EVERYTHING YOU BELIEVE IS WRONG.",
      "THE SECRET THE PROS DON'T WANT YOU TO KNOW."
    ]
    
    // Use ALL-CAPS hook 60% of the time, regular sentence 40%
    const firstSentence = Math.random() > 0.4 ? 
      allCapsHooks[Math.floor(Math.random() * allCapsHooks.length)] : 
      this.enhanceSentenceForImpact(sentences[0] || "Your approach to health is about to transform completely.")
    
    const secondSentence = this.enhanceSentenceForImpact(
      sentences[1] || "Here's everything you need to know to get results that actually last and change your life."
    )
    
    return `<p class="lead text-xl text-gray-700 mb-8 leading-relaxed font-medium">${firstSentence} ${secondSentence}</p>`
  }
  
  private static createQuickTakeawaysBox(primaryKeyword: string): string {
    const takeaways = [
      `${primaryKeyword} can transform your health in ways science is just beginning to understand`,
      `The right approach makes the difference between mediocre results and life-changing transformation`,
      `Expert-backed strategies deliver measurable results faster than trial-and-error methods`,
      `Small, consistent changes compound into massive improvements over just 30 days`,
      `Most people quit right before the breakthrough—consistency is your secret weapon`,
      `The latest research reveals why ${primaryKeyword} works better than anyone expected`,
      `Professional athletes use these exact techniques to maximize their ${primaryKeyword} results`
    ]
    
    // Select 3-5 takeaways randomly
    const selectedTakeaways = takeaways
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 3) // 3-5 items
    
    return `<div class="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
  <h3 class="text-lg font-bold text-red-900 mb-4">Quick Takeaways</h3>
  <ul class="space-y-3 text-red-800">
${selectedTakeaways.map(takeaway => `    <li class="flex items-start"><span class="text-red-600 font-bold mr-3">•</span><span class="leading-relaxed">${takeaway}</span></li>`).join('\n')}
  </ul>
</div>`
  }
  
  private static createMensHealthBodySections(sentences: string[], primaryKeyword: string, lsiSynonyms: string[]): string {
    const sections: string[] = []
    const targetWordsPerSection = 200 // 150-250 word range
    
    // Generate strategic H2 headings that include primary keyword and LSI synonyms
    const h2Headings = this.generateSEOOptimizedH2s(primaryKeyword, lsiSynonyms)
    
    let currentSection: string[] = []
    let wordCount = 0
    let headingIndex = 0
    
    sentences.forEach((sentence, index) => {
      const enhancedSentence = this.enhanceSentenceForImpact(sentence)
      currentSection.push(enhancedSentence)
      wordCount += enhancedSentence.split(' ').length
      
      // Create new section every 150-250 words or at logical breaks
      if (wordCount >= targetWordsPerSection || index === sentences.length - 1) {
        if (currentSection.length > 0) {
          const heading = h2Headings[headingIndex % h2Headings.length]
          const sectionContent = this.formatMensHealthSection(currentSection, headingIndex, primaryKeyword)
          sections.push(`<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">${heading}</h2>\n\n${sectionContent}`)
          headingIndex++
        }
        currentSection = []
        wordCount = 0
      }
    })
    
    return sections.join('\n\n')
  }
  
  private static generateSEOOptimizedH2s(primaryKeyword: string, lsiSynonyms: string[]): string[] {
    return [
      `Why ${primaryKeyword} Works Better Than You Think`, // Primary keyword
      `The Science Behind ${lsiSynonyms[0] || primaryKeyword} Success`, // LSI synonym
      `Expert-Approved ${primaryKeyword} Strategies That Actually Work`,
      `Common ${primaryKeyword} Mistakes That Are Sabotaging Your Results`,
      `Advanced ${lsiSynonyms[1] || primaryKeyword} Techniques for Maximum Impact`,
      `How to Maximize Your ${primaryKeyword} Results in Record Time`,
      `The Future of ${lsiSynonyms[2] || primaryKeyword} Research and Innovation`,
      `Building Long-Term ${primaryKeyword} Success That Lasts`
    ]
  }
  
  private static formatMensHealthSection(sentences: string[], sectionIndex: number, primaryKeyword: string): string {
    // Break into short paragraphs (1-3 sentences each)
    const paragraphs = this.createImpactfulParagraphs(sentences)
    let content = paragraphs.map(para => `<p class="mb-6 text-gray-700 leading-relaxed">${para}</p>`).join('\n\n')
    
    // Add strategic content elements based on section position
    if (sectionIndex === 1) {
      // Second section: Add expert quote in blockquote format
      content += `\n\n${this.generateExpertBlockquote(primaryKeyword)}`
    } else if (sectionIndex === 2) {
      // Third section: Add numbered or bulleted actionable list
      content += `\n\n${this.generateActionableList(primaryKeyword)}`
    } else if (sectionIndex === 3) {
      // Fourth section: Add CTA call-out
      content += `\n\n${this.generateImpactfulCTACallout()}`
    }
    
    // Add image placeholder strategically (not every section)
    if (Math.random() > 0.6) {
      content += `\n\n${this.generateContextualImagePlaceholder(primaryKeyword, sectionIndex)}`
    }
    
    return content
  }
  
  private static createImpactfulParagraphs(sentences: string[]): string[] {
    const paragraphs: string[] = []
    let currentParagraph: string[] = []
    
    sentences.forEach((sentence, index) => {
      currentParagraph.push(sentence)
      
      // Create paragraph every 1-3 sentences for better readability
      const shouldEndParagraph = 
        currentParagraph.length >= Math.floor(Math.random() * 3) + 1 || 
        index === sentences.length - 1
      
      if (shouldEndParagraph) {
        paragraphs.push(currentParagraph.join(' '))
        currentParagraph = []
      }
    })
    
    return paragraphs
  }
  
  private static generateExpertBlockquote(primaryKeyword: string): string {
    const experts = [
      { name: "Dr. Sarah Johnson", credential: "Exercise Physiologist, Harvard Medical School" },
      { name: "Michael Chen", credential: "Certified Strength and Conditioning Specialist" },
      { name: "Dr. Amanda Rodriguez", credential: "Sports Nutritionist, Stanford University" },
      { name: "James Thompson", credential: "Performance Specialist, Olympic Training Center" },
      { name: "Dr. Kevin Martinez", credential: "Sports Medicine Physician, Mayo Clinic" }
    ]
    
    const expert = experts[Math.floor(Math.random() * experts.length)]
    
    const impactfulQuotes = [
      `The key to ${primaryKeyword} success isn't just consistency—it's progressive overload combined with intelligent recovery protocols.`,
      `What separates elite performers from weekend warriors is their systematic approach to ${primaryKeyword} optimization.`,
      `The biggest mistake I see is people neglecting the neurological adaptations that make ${primaryKeyword} training truly effective.`,
      `Every high-performing client I work with understands that ${primaryKeyword} is a skill that requires deliberate practice, not just effort.`,
      `The latest research confirms what we've suspected: ${primaryKeyword} affects your entire physiological system in ways we're still discovering.`
    ]
    
    const quote = impactfulQuotes[Math.floor(Math.random() * impactfulQuotes.length)]
    
    return `<blockquote class="border-l-4 border-red-600 pl-6 my-8 bg-gray-50 py-6 rounded-r-lg">
  <p class="text-lg italic text-gray-700 mb-3 leading-relaxed">"${quote}"</p>
  <footer class="text-gray-600 font-medium">— <strong>${expert.name}</strong>, ${expert.credential}</footer>
</blockquote>`
  }
  
  private static generateActionableList(primaryKeyword: string): string {
    const actionableSteps = [
      `Start with proper form assessment—technique trumps intensity every single time`,
      `Track your progress using objective metrics, not just how you feel`,
      `Focus on compound movements that deliver maximum return on investment`,
      `Allow adequate recovery time—your gains happen during rest, not during work`,
      `Gradually increase intensity using the 10% rule to avoid plateaus`,
      `Stay consistent for a minimum of 8-12 weeks to see meaningful adaptations`,
      `Listen to your body's feedback and adjust your approach accordingly`,
      `Work with qualified professionals when plateau-breaking is necessary`
    ]
    
    const selectedActions = actionableSteps
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 5) // 5-7 items
    
    const listType = Math.random() > 0.5 ? 'numbered' : 'bulleted'
    
    if (listType === 'numbered') {
      return `<div class="bg-gray-100 p-6 rounded-lg my-8">
  <h3 class="text-lg font-bold text-gray-900 mb-4">${primaryKeyword} Action Steps:</h3>
  <ol class="space-y-3 text-gray-700">
${selectedActions.map((action, index) => `    <li class="flex items-start"><span class="font-bold text-red-600 mr-3 text-lg">${index + 1}.</span><span class="leading-relaxed">${action}</span></li>`).join('\n')}
  </ol>
</div>`
    } else {
      return `<div class="bg-blue-50 p-6 rounded-lg my-8">
  <h3 class="text-lg font-bold text-blue-900 mb-4">Essential ${primaryKeyword} Principles:</h3>
  <ul class="space-y-3 text-blue-800">
${selectedActions.map(action => `    <li class="flex items-start"><span class="text-blue-600 font-bold mr-3">•</span><span class="leading-relaxed">${action}</span></li>`).join('\n')}
  </ul>
</div>`
    }
  }
  
  private static generateImpactfulCTACallout(): string {
    const callouts = [
      {
        title: "Quick Tip",
        content: "The best time to start is now—small actions today compound into massive results tomorrow."
      },
      {
        title: "READ MORE",
        content: "Ready to take your performance to the next level? The science shows this one change makes all the difference."
      },
      {
        title: "Pro Tip",
        content: "Elite performers focus on consistency over perfection—progress beats paralysis every time."
      },
      {
        title: "Expert Insight", 
        content: "Most people quit right before the breakthrough happens—push through the plateau."
      },
      {
        title: "Game Changer",
        content: "This single adjustment has helped thousands of men transform their results in just weeks."
      }
    ]
    
    const callout = callouts[Math.floor(Math.random() * callouts.length)]
    
    return `<div class="bg-red-600 text-white p-6 rounded-lg my-8">
  <h3 class="text-lg font-bold mb-3">${callout.title}</h3>
  <p class="leading-relaxed">${callout.content}</p>
</div>`
  }
  
  private static generateContextualImagePlaceholder(primaryKeyword: string, sectionIndex: number): string {
    const imageTypes = [
      'demonstration',
      'technique',
      'results',
      'comparison',
      'scientific study',
      'professional training'
    ]
    
    const imageType = imageTypes[sectionIndex % imageTypes.length]
    
    return `<figure class="my-8">
  <img src="{IMAGE_URL}" alt="Professional ${primaryKeyword} ${imageType} showing proper form and technique" class="w-full rounded-lg shadow-lg">
  <figcaption class="text-center text-gray-600 text-sm mt-3 italic">Proper ${primaryKeyword} technique is essential for maximizing results and preventing injury.</figcaption>
</figure>`
  }
  
  private static enhanceSentenceForImpact(sentence: string): string {
    // Convert to powerful second-person voice with active verbs
    let enhanced = sentence
      .replace(/\b(people|individuals|one|someone|persons)\b/gi, 'you')
      .replace(/\b(they|them|their)\b/gi, 'your')
      .replace(/\b(is done|can be done|should be done)\b/gi, 'you should do')
      .replace(/\b(it's important|it is important)\b/gi, 'you need')
      .replace(/\b(research shows|studies show|science shows)\b/gi, 'research proves that you')
      .replace(/\b(may help|might help|could help)\b/gi, 'will help you')
      .replace(/\b(can improve|may improve)\b/gi, 'will improve your')
    
    // Add power words for more impact
    if (Math.random() > 0.7) {
      const powerWords = ['proven', 'essential', 'crucial', 'game-changing', 'revolutionary', 'breakthrough', 'cutting-edge']
      const powerWord = powerWords[Math.floor(Math.random() * powerWords.length)]
      enhanced = enhanced.replace(/\b(important|good|effective|helpful)\b/gi, powerWord)
    }
    
    // Add urgency and specificity
    enhanced = enhanced
      .replace(/\bsoon\b/gi, 'within days')
      .replace(/\bquickly\b/gi, 'in record time')
      .replace(/\bmany\b/gi, 'countless')
      .replace(/\bsome\b/gi, 'specific')
    
    return enhanced
  }
  
  private static generateLSISynonyms(primaryKeyword: string): string[] {
    const lsiMap: Record<string, string[]> = {
      'exercise': ['training', 'workout', 'fitness'],
      'workout': ['training', 'exercise', 'fitness routine'],
      'fitness': ['conditioning', 'training', 'physical fitness'],
      'nutrition': ['diet', 'eating', 'nutritional strategy'],
      'health': ['wellness', 'vitality', 'wellbeing'],
      'muscle': ['strength', 'muscle building', 'muscular development'],
      'weight': ['fat loss', 'body composition', 'weight management'],
      'strength': ['power', 'muscle building', 'resistance training'],
      'cardio': ['cardiovascular', 'aerobic', 'endurance'],
      'diet': ['nutrition', 'eating plan', 'nutritional approach'],
      'caffeine': ['stimulants', 'energy', 'performance enhancers'],
      'energy': ['vitality', 'stamina', 'endurance'],
      'sleep': ['recovery', 'rest', 'sleep optimization'],
      'stress': ['stress management', 'mental health', 'psychological wellness']
    }
    
    const keyword = primaryKeyword.toLowerCase()
    return lsiMap[keyword] || ['training', 'performance', 'optimization']
  }
  
  private static generateMetaDescription(title: string, content: string, primaryKeyword: string): string {
    const benefit = this.getBenefit()
    const template = `Master ${primaryKeyword} with expert-backed strategies. ${benefit} in just weeks. Science-based approach that actually works.`
    
    if (template.length <= 160) {
      return template
    }
    
    // Fallback to excerpt from content
    const excerpt = this.generateExcerpt(content, 25)
    return excerpt.length <= 160 ? excerpt : excerpt.substring(0, 157) + '...'
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
  
  private static generateExcerpt(content: string, maxLength: number): string {
    const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const words = text.split(' ').slice(0, maxLength)
    return words.join(' ') + (words.length >= maxLength ? '...' : '')
  }
  
  private static improveReadability(content: string): string {
    // Clean and format content for better readability
    let improved = this.cleanAndFormatContent(content)
    
    // Ensure proper paragraph spacing
    improved = improved.replace(/\n\s*\n/g, '\n\n')
    
    // Wrap orphaned text in paragraphs
    improved = improved.replace(/^([^<\n]+)$/gm, '<p class="mb-6 text-gray-700 leading-relaxed">$1</p>')
    
    return improved
  }
  
  private static addHeadings(content: string, primaryKeyword: string): string {
    // If no headings exist, add strategic ones
    if (!/<h[1-6]/i.test(content)) {
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
      const headings = this.generateSEOOptimizedH2s(primaryKeyword, this.generateLSISynonyms(primaryKeyword))
      
      let result = ''
      let headingIndex = 0
      
      paragraphs.forEach((paragraph, index) => {
        if (index > 0 && index % 3 === 0 && headingIndex < headings.length) {
          result += `\n\n<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6">${headings[headingIndex]}</h2>\n\n`
          headingIndex++
        }
        result += paragraph + '\n\n'
      })
      
      return result.trim()
    }
    
    return content
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

  private static inferCategoryFromKeyword(primaryKeyword: string): string {
    const keyword = primaryKeyword.toLowerCase()
    
    // Map keywords to appropriate categories
    const categoryMap: Record<string, string> = {
      // Fitness related
      'exercise': 'fitness',
      'workout': 'fitness', 
      'training': 'fitness',
      'muscle': 'fitness',
      'strength': 'fitness',
      'cardio': 'fitness',
      'gym': 'fitness',
      'fitness': 'fitness',
      
      // Nutrition related
      'nutrition': 'nutrition',
      'diet': 'nutrition',
      'protein': 'nutrition',
      'food': 'nutrition',
      'supplements': 'nutrition',
      'vitamins': 'nutrition',
      'eating': 'nutrition',
      'meal': 'nutrition',
      
      // Health related  
      'health': 'health',
      'medical': 'health',
      'wellness': 'health',
      'disease': 'health',
      'prevention': 'health',
      'caffeine': 'health',
      'energy': 'health',
      'sleep': 'health',
      'stress': 'health',
      
      // Weight loss
      'weight': 'weight-loss',
      'loss': 'weight-loss',
      'fat': 'weight-loss',
      'calories': 'weight-loss',
      
      // Style/lifestyle
      'style': 'style',
      'fashion': 'style',
      'grooming': 'style',
      'lifestyle': 'style'
    }
    
    // Find matching category
    for (const [key, category] of Object.entries(categoryMap)) {
      if (keyword.includes(key)) {
        return category
      }
    }
    
    // Default to health if no match found
    return 'health'
  }

  private static async detectAndConvertTeasers(content: string, title: string, category: string): Promise<string> {
    try {
      // Get all articles for teaser linking
      const { data: articles } = await getAllArticles();
      if (!articles) return content;

      // Extract primary topic from main title
      const primaryTopic = this.extractPrimaryKeyword(title);
      
      // Split content into sections by headings
      const sections = this.splitContentIntoSections(content);
      
      // Analyze each section for topic coherence
      const processedSections: string[] = [];
      let hasSubjectChange = false;
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionTopic = this.extractSectionTopic(section);
        const topicRelevance = this.calculateTopicRelevance(primaryTopic, sectionTopic, category);
        
        // If relevance is low, this might be teaser content
        if (topicRelevance < 0.3 && i > 2) { // Only check after first few sections
          console.log(`🔍 Detected potential teaser content: "${sectionTopic}" (relevance: ${topicRelevance.toFixed(2)})`);
          
          // Try to convert to teaser
          const teaserContent = await this.convertToTeaser(section, articles, category);
          if (teaserContent) {
            processedSections.push(teaserContent);
            hasSubjectChange = true;
            continue;
          }
        }
        
        // Keep original section
        processedSections.push(section);
      }
      
      if (hasSubjectChange) {
        console.log('✅ Successfully converted off-topic sections to article teasers');
      }
      
      return processedSections.join('\n\n');
    } catch (error) {
      console.error('Error in teaser detection:', error);
      return content;
    }
  }

  private static splitContentIntoSections(content: string): string[] {
    // Split by H2 headings while preserving them
    const sections = content.split(/(<h2[^>]*>.*?<\/h2>)/i);
    const processedSections: string[] = [];
    
    for (let i = 0; i < sections.length; i += 2) {
      const heading = sections[i + 1] || '';
      const content = sections[i] || '';
      
      if (heading || content.trim()) {
        processedSections.push((heading + content).trim());
      }
    }
    
    return processedSections.filter(section => section.length > 50); // Filter very short sections
  }

  private static extractSectionTopic(section: string): string {
    // Extract text content and get key terms
    const text = section.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text.toLowerCase().split(' ')
      .filter(word => word.length > 4)
      .filter(word => !['that', 'this', 'with', 'from', 'your', 'they', 'have', 'will', 'been', 'said', 'when', 'where', 'what', 'would', 'could', 'should'].includes(word));
    
    // Count word frequency to find main topic
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    // Get most frequent meaningful word
    const sortedWords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return sortedWords[0]?.[0] || 'general';
  }

  private static calculateTopicRelevance(primaryTopic: string, sectionTopic: string, category: string): number {
    // Define topic relationships
    const topicSynonyms = new Map([
      ['high', ['tactics', 'techniques', 'strategies', 'methods', 'training', 'performance']],
      ['fitness', ['exercise', 'workout', 'training', 'gym', 'strength', 'muscle']],
      ['health', ['wellness', 'medical', 'nutrition', 'diet', 'lifestyle']],
      ['nutrition', ['diet', 'food', 'eating', 'protein', 'vitamins', 'supplements']],
      ['weight', ['loss', 'management', 'diet', 'calories', 'fat', 'body']],
      ['coffee', ['caffeine', 'energy', 'drink', 'stimulant', 'beverage']],
      ['cooking', ['food', 'recipe', 'meal', 'kitchen', 'ingredients', 'preparation']]
    ]);

    // Check direct match
    if (primaryTopic === sectionTopic) return 1.0;
    
    // Check synonym relationships
    const primarySynonyms = topicSynonyms.get(primaryTopic) || [];
    const sectionSynonyms = topicSynonyms.get(sectionTopic) || [];
    
    if (primarySynonyms.includes(sectionTopic)) return 0.8;
    if (sectionSynonyms.includes(primaryTopic)) return 0.8;
    
    // Check category relevance
    const categoryTopics = {
      'health': ['health', 'medical', 'wellness', 'nutrition', 'diet'],
      'fitness': ['fitness', 'exercise', 'workout', 'training', 'muscle'],
      'nutrition': ['nutrition', 'diet', 'food', 'protein', 'eating'],
      'weight-loss': ['weight', 'loss', 'diet', 'calories', 'fat']
    };
    
    const relevantTopics = categoryTopics[category] || [];
    if (relevantTopics.includes(sectionTopic)) return 0.6;
    
    // Low relevance if completely unrelated (like cooking in a fitness article)
    const unrelatedTopics = ['cooking', 'recipe', 'meal', 'ingredients', 'kitchen'];
    if (category !== 'nutrition' && unrelatedTopics.includes(sectionTopic)) {
      return 0.1;
    }
    
    return 0.4; // Default moderate relevance
  }

  private static async convertToTeaser(section: string, articles: any[], category: string): Promise<string | null> {
    try {
      // Extract potential article titles from the section
      const potentialTitles = this.extractPotentialTitles(section);
      
      if (potentialTitles.length === 0) return null;
      
      // Find matching articles for each potential title
      const teasers: string[] = [];
      
      for (const potentialTitle of potentialTitles.slice(0, 3)) { // Limit to 3 teasers
        const matchingArticle = this.findBestMatchingArticle(potentialTitle, articles, category);
        
        if (matchingArticle) {
          const teaser = this.createArticleTeaser(matchingArticle, potentialTitle);
          teasers.push(teaser);
        }
      }
      
      if (teasers.length > 0) {
        return `<div class="grid grid-cols-1 md:grid-cols-${Math.min(teasers.length, 3)} gap-6 my-12">
  <h3 class="col-span-full text-xl font-bold text-gray-900 mb-6">Related Articles</h3>
  ${teasers.join('\n  ')}
</div>`;
      }
      
      return null;
    } catch (error) {
      console.error('Error converting to teaser:', error);
      return null;
    }
  }

  private static extractPotentialTitles(section: string): string[] {
    const titles: string[] = [];
    
    // Look for patterns that suggest article titles
    const titlePatterns = [
      /How to ([^.!?]+)/gi,
      /The (\w+(?:\s+\w+){1,5})/gi,
      /(\d+\s+(?:Ways|Tips|Steps|Secrets|Rules)[^.!?]*)/gi,
      /([A-Z][^.!?]{20,80})/g
    ];
    
    titlePatterns.forEach(pattern => {
      const matches = section.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/<[^>]*>/g, '').trim();
          if (cleaned.length > 10 && cleaned.length < 100) {
            titles.push(cleaned);
          }
        });
      }
    });
    
    return [...new Set(titles)]; // Remove duplicates
  }

  private static findBestMatchingArticle(title: string, articles: any[], preferredCategory: string): any | null {
    const titleWords = title.toLowerCase().split(' ').filter(word => word.length > 3);
    
    let bestMatch = null;
    let bestScore = 0;
    
    for (const article of articles) {
      const articleWords = article.title.toLowerCase().split(' ');
      const matchingWords = titleWords.filter(word => 
        articleWords.some(articleWord => articleWord.includes(word) || word.includes(articleWord))
      );
      
      let score = matchingWords.length / titleWords.length;
      
      // Boost score for same category
      if (article.category.toLowerCase() === preferredCategory.toLowerCase()) {
        score += 0.2;
      }
      
      // Boost score for published articles
      if (article.status === 'published') {
        score += 0.1;
      }
      
      if (score > bestScore && score > 0.3) { // Minimum relevance threshold
        bestScore = score;
        bestMatch = article;
      }
    }
    
    return bestMatch;
  }

  private static createArticleTeaser(article: any, originalTitle: string): string {
    const truncatedExcerpt = article.excerpt 
      ? article.excerpt.substring(0, 120) + (article.excerpt.length > 120 ? '...' : '')
      : 'Discover expert insights and actionable strategies...';
    
    return `<article class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
    <div class="p-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        <a href="/articles/${article.slug}" class="hover:text-red-600 transition-colors">${article.title}</a>
      </h4>
      <p class="text-gray-600 text-sm mb-4 line-clamp-3">${truncatedExcerpt}</p>
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">${article.category}</span>
        <a href="/articles/${article.slug}" class="text-red-600 text-sm font-medium hover:text-red-700 transition-colors">
          Read More →
        </a>
      </div>
    </div>
  </article>`;
  }
}
