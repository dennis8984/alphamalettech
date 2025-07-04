import Anthropic from '@anthropic-ai/sdk';
import { convertMarkdownToHtml } from './markdown-to-html';
import { generateAcademicLinks, addInlineAcademicLinks } from './academic-link-generator';
import OpenAI from 'openai';

interface ContentEnhancementOptions {
  rewriteForOriginality?: boolean
  improveReadability?: boolean
  addHeadings?: boolean
  optimizeForSEO?: boolean
  primaryKeyword?: string
  generateImages?: boolean
}

interface EnhancedContent {
  title: string
  content: string
  metaDescription: string
  warnings: string[]
  generatedImages?: { description: string, url: string }[]
}

export class ClaudeContentEnhancer {
  private anthropic: Anthropic | null = null;
  private openai: OpenAI | null = null; // Keep OpenAI for DALL-E 3 image generation only
  
  constructor() {
    // Check for either ANTHROPIC_API_KEY or CLAUDE_API_KEY (for backward compatibility)
    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (apiKey) {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
      });
    }
    
    // Initialize OpenAI only for image generation
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }
  
  async enhanceContent(
    title: string, 
    content: string, 
    options: ContentEnhancementOptions
  ): Promise<EnhancedContent> {
    if (!this.anthropic) {
      throw new Error('Anthropic API key not configured. Please set ANTHROPIC_API_KEY or CLAUDE_API_KEY environment variable.');
    }
    
    const primaryKeyword = options.primaryKeyword || this.extractPrimaryKeyword(title);
    
    // Load the article prompt template
    const articlePromptGuidelines = await this.loadArticlePromptGuidelines();
    
    // Prepare the system prompt based on article-prompts.md guidelines
    const systemPrompt = `You are an expert men's health and fitness writer following the Men's Health Article DNA guidelines. Your role is to rewrite articles to be engaging, informative, and SEO-optimized while maintaining accuracy and authority.

${articlePromptGuidelines}

REWRITING GUIDELINES:
1. Maintain the core factual content while improving engagement and readability
2. Use active voice and second-person perspective ("you") throughout
3. Include specific numbers, statistics, and expert credentials where relevant
4. Break up long paragraphs into shorter, punchier ones (2-3 sentences max)
5. Add relevant subheadings every 200-300 words for better scanability
6. Naturally incorporate the primary keyword "${primaryKeyword}" 3-5 times
7. Use power words and emotional triggers from the guidelines
8. Ensure content follows the category-specific requirements
9. Add actionable takeaways and specific next steps
10. Write at an 8th-grade reading level for accessibility

IMPORTANT: Output clean content without any markdown symbols. Use proper HTML tags for formatting.`;
    
    const userPrompt = this.buildUserPrompt(title, content, options);
    
    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-opus-4-20250514',
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });
      
      const enhancedContent = this.parseClaudeResponse(message.content[0]);
      
      // Process the content
      let processedContent = enhancedContent.content;
      
      // Remove any Title: prefix from the title
      let processedTitle = enhancedContent.title
        .replace(/^(Title:|New Title:)\s*/i, '')
        .replace(/^#+\s+/, '')
        .replace(/\*\*/g, '')
        .replace(/[`_]/g, '')
        .trim();
      
      // Convert markdown to HTML if needed
      processedContent = convertMarkdownToHtml(processedContent);
      
      // Add academic links
      const academicLinks = await generateAcademicLinks(processedTitle, processedContent);
      processedContent = addInlineAcademicLinks(processedContent, academicLinks, primaryKeyword);
      
      // Generate images if requested
      let generatedImages: { description: string, url: string }[] = [];
      if (options.generateImages && this.openai) {
        generatedImages = await this.generateImagesForContent(processedTitle, processedContent);
      }
      
      return {
        title: processedTitle,
        content: processedContent,
        metaDescription: enhancedContent.metaDescription || this.generateMetaDescription(processedTitle, processedContent, primaryKeyword),
        warnings: enhancedContent.warnings || [],
        generatedImages
      };
    } catch (error) {
      console.error('Claude enhancement error:', error);
      throw new Error('Failed to enhance content with Claude');
    }
  }
  
  private async loadArticlePromptGuidelines(): Promise<string> {
    // In production, you might want to load this from a file
    // For now, we'll include key sections inline
    return `
### Voice and Tone Guidelines
- Authoritative but approachable
- Conversational without being casual
- Encouraging without overselling
- Honest about challenges
- Inclusive and respectful

### Language Rules
- Active voice preferred
- Short paragraphs (2-3 sentences)
- Vary sentence length
- Avoid jargon without explanation
- Use "you" to address reader

### Power Words for Headlines
Finally, Ultimate, Essential, Proven, Expert-Backed, Science-Based, Complete, Revolutionary, Game-Changing, Breakthrough

### Transition Phrases
"Here's the thing:", "But here's what actually works:", "The truth is:", "What most people don't realize:", "The key difference:"

### Social Proof Phrases
"According to research from [University]", "[Expert name], [credentials], explains", "Studies have shown", "In my experience as a [credential]", "Men's Health readers report"`;
  }
  
  private buildUserPrompt(title: string, content: string, options: ContentEnhancementOptions): string {
    let prompt = `Please rewrite the following men's health article to be more engaging and optimized for SEO.

Original Title: ${title}

Original Content:
${content}

Requirements:
`;
    
    if (options.rewriteForOriginality) {
      prompt += `- Rewrite for 100% originality while maintaining factual accuracy\n`;
    }
    
    if (options.improveReadability) {
      prompt += `- Improve readability with shorter sentences and paragraphs\n`;
    }
    
    if (options.addHeadings) {
      prompt += `- Add compelling subheadings every 200-300 words\n`;
    }
    
    if (options.optimizeForSEO && options.primaryKeyword) {
      prompt += `- Optimize for the keyword "${options.primaryKeyword}" (use 3-5 times naturally)\n`;
    }
    
    prompt += `
Please provide:
1. An improved, SEO-optimized title (without "Title:" prefix)
2. The rewritten article content
3. A 155-character meta description
4. Any warnings about content that may need fact-checking

Format your response as:
TITLE: [improved title]
META: [meta description]
CONTENT: [rewritten article]
WARNINGS: [any concerns]`;
    
    return prompt;
  }
  
  private parseClaudeResponse(content: any): { title: string; content: string; metaDescription?: string; warnings?: string[] } {
    if (typeof content.text !== 'string') {
      throw new Error('Invalid Claude response format');
    }
    
    const text = content.text;
    
    // Parse the response
    const titleMatch = text.match(/TITLE:\s*(.+?)(?=\n(?:META:|CONTENT:))/s);
    const metaMatch = text.match(/META:\s*(.+?)(?=\n(?:CONTENT:|WARNINGS:))/s);
    const contentMatch = text.match(/CONTENT:\s*(.+?)(?=\nWARNINGS:|$)/s);
    const warningsMatch = text.match(/WARNINGS:\s*(.+?)$/s);
    
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    const metaDescription = metaMatch ? metaMatch[1].trim() : undefined;
    const articleContent = contentMatch ? contentMatch[1].trim() : text;
    const warnings = warningsMatch ? warningsMatch[1].trim().split('\n').filter(w => w.trim()) : undefined;
    
    return {
      title,
      content: articleContent,
      metaDescription,
      warnings
    };
  }
  
  private extractPrimaryKeyword(title: string): string {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'after']);
    const words = title.toLowerCase().split(/\s+/);
    const keywords = words.filter(word => !commonWords.has(word) && word.length > 3);
    return keywords.join(' ');
  }
  
  private generateMetaDescription(title: string, content: string, keyword: string): string {
    const firstParagraph = content.substring(0, 200).replace(/<[^>]*>/g, '');
    let description = `${title}. ${firstParagraph}`.substring(0, 155);
    
    if (!description.toLowerCase().includes(keyword.toLowerCase())) {
      description = `${keyword} - ${description}`.substring(0, 155);
    }
    
    return description.trim();
  }
  
  private async generateImagesForContent(title: string, content: string): Promise<{ description: string, url: string }[]> {
    if (!this.openai) return [];
    
    const images: { description: string, url: string }[] = [];
    
    // Extract key concepts for image generation
    const imagePrompts = this.extractImagePrompts(title, content);
    
    for (const prompt of imagePrompts.slice(0, 3)) { // Limit to 3 images
      try {
        const imageResponse = await this.openai.images.generate({
          model: "dall-e-3",
          prompt: `Professional men's health and fitness photo: ${prompt}. High quality, realistic, editorial style.`,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          style: "natural"
        });
        
        const imageUrl = imageResponse.data?.[0]?.url;
        if (imageUrl) {
          images.push({
            description: prompt,
            url: imageUrl
          });
        }
      } catch (error) {
        console.error('Image generation error:', error);
      }
    }
    
    return images;
  }
  
  private extractImagePrompts(title: string, content: string): string[] {
    const prompts: string[] = [];
    
    // Hero image based on title
    prompts.push(title);
    
    // Extract key concepts from headings
    const headingMatches = content.match(/<h[2-3][^>]*>([^<]+)<\/h[2-3]>/gi);
    if (headingMatches) {
      headingMatches.forEach(match => {
        const heading = match.replace(/<[^>]+>/g, '').trim();
        if (heading.length > 10 && heading.length < 100) {
          prompts.push(heading);
        }
      });
    }
    
    return prompts;
  }
}