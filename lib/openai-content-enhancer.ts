import OpenAI from 'openai';
import { convertMarkdownToHtml } from './markdown-to-html';
import { generateAcademicLinks, addInlineAcademicLinks } from './academic-link-generator';

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

export class OpenAIContentEnhancer {
  private openai: OpenAI | null = null;
  
  constructor() {
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
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }
    
    const primaryKeyword = options.primaryKeyword || this.extractPrimaryKeyword(title);
    
    // Prepare the system prompt based on article-prompts.md guidelines
    const systemPrompt = `You are an expert men's health and fitness writer. Rewrite articles to be engaging, informative, and SEO-optimized while maintaining accuracy and authority.

IMPORTANT GUIDELINES:
1. Write in an engaging, conversational tone that connects with male readers
2. Use active voice and second-person perspective ("you") to make content relatable
3. Include practical, actionable advice backed by science
4. Optimize for SEO with the primary keyword: "${primaryKeyword}"
5. Use short paragraphs (2-3 sentences) and varied sentence lengths
6. Include relevant statistics and expert insights where appropriate
7. Create compelling subheadings that include keywords naturally

STRUCTURE REQUIREMENTS:
- Start with a powerful hook that addresses reader pain points
- Include a "Quick Takeaways" box near the beginning with 3-5 key points
- Use H2 headings (#### in markdown) every 150-250 words
- Add relevant lists, tips, or action steps throughout
- End with a strong conclusion that motivates action
- Include an FAQ section at the end with 5-7 questions

FORMATTING:
- Use #### for main section headers (H2)
- Use ### for subsection headers (H3)
- Use **bold** for emphasis
- Use bullet points with - or * 
- Add image placeholders: ![DALL-E: Detailed description of what the image should show]
- If original images are provided in HTML comments, distribute them throughout the article

Remember: The content should be completely rewritten to pass Copyscape and provide unique value.`;

    const userPrompt = `Please rewrite the following article to meet all the guidelines above.

Original Title: ${title}
Primary Keyword: ${primaryKeyword}

Original Content:
${content}

Requirements:
${options.rewriteForOriginality ? '- Completely rewrite for originality (must pass Copyscape)\n' : ''}
${options.improveReadability ? '- Improve readability with short paragraphs and clear language\n' : ''}
${options.addHeadings ? '- Add engaging H2 headings throughout\n' : ''}
${options.optimizeForSEO ? '- Optimize for SEO with keyword placement and meta description\n' : ''}

Please provide:
1. A compelling new title (6-13 words)
2. The fully rewritten article content with all formatting
3. A meta description (150-160 characters) that includes the primary keyword`;

    try {
      console.log('🤖 Calling OpenAI GPT-4o-mini for content enhancement...');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 6000,
        presence_penalty: 0.3,
        frequency_penalty: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response to extract title, content, and meta description
      const parsedContent = this.parseAIResponse(response);
      
      // Extract original images from the content if present
      const originalImages = this.extractOriginalImages(content);
      
      // Generate images with DALL-E 3 if enabled
      let generatedImages: { description: string, url: string }[] = [];
      if (options.generateImages) {
        console.log('🎨 Generating images with DALL-E 3...');
        const contentWithImages = await this.generateDALLE3Images(parsedContent.content, primaryKeyword);
        parsedContent.content = contentWithImages.content;
        generatedImages = contentWithImages.images;
      } else {
        // Just enhance image descriptions without generating
        parsedContent.content = this.enhanceImageDescriptions(parsedContent.content, primaryKeyword);
      }
      
      // Distribute original images throughout the content
      if (originalImages.length > 0) {
        console.log(`📸 Distributing ${originalImages.length} original images throughout the article...`);
        parsedContent.content = this.distributeOriginalImages(parsedContent.content, originalImages, primaryKeyword);
      }
      
      // Convert markdown to HTML
      console.log('📝 Converting markdown to HTML...');
      let htmlContent = convertMarkdownToHtml(parsedContent.content);
      
      // Add academic links and references
      console.log('🎓 Adding academic references...');
      htmlContent = addInlineAcademicLinks(htmlContent);
      htmlContent = generateAcademicLinks(htmlContent, primaryKeyword);
      
      return {
        title: parsedContent.title,
        content: htmlContent,
        metaDescription: parsedContent.metaDescription,
        warnings: [],
        generatedImages: generatedImages.length > 0 ? generatedImages : undefined
      };
      
    } catch (error) {
      console.error('OpenAI enhancement error:', error);
      throw error;
    }
  }
  
  private async generateDALLE3Images(content: string, primaryKeyword: string): Promise<{ content: string, images: { description: string, url: string }[] }> {
    const images: { description: string, url: string }[] = [];
    let updatedContent = content;
    
    // Find all image placeholders
    const imagePlaceholders = content.match(/!\[DALL-E:([^\]]*)\]/g) || [];
    
    // Limit to 5 images per article to manage costs
    const imagesToGenerate = imagePlaceholders.slice(0, 5);
    
    for (const placeholder of imagesToGenerate) {
      const descriptionMatch = placeholder.match(/!\[DALL-E:([^\]]*)\]/);
      if (!descriptionMatch) continue;
      
      const baseDescription = descriptionMatch[1].trim();
      const enhancedPrompt = this.createDALLE3Prompt(baseDescription, primaryKeyword);
      
      try {
        console.log(`🎨 Generating image: ${enhancedPrompt.substring(0, 60)}...`);
        
        const imageResponse = await this.openai!.images.generate({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1,
          size: "1792x1024", // 16:9 aspect ratio for web
          quality: "standard",
          style: "natural"
        });
        
        const imageUrl = imageResponse.data?.[0]?.url;
        if (imageUrl) {
          images.push({ description: baseDescription, url: imageUrl });
          
          // Replace placeholder with actual image
          updatedContent = updatedContent.replace(
            placeholder,
            `![${baseDescription}](${imageUrl})`
          );
          
          console.log('✅ Image generated successfully');
        }
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('DALL-E 3 generation error:', error);
        // Keep the placeholder if generation fails
      }
    }
    
    return { content: updatedContent, images };
  }
  
  private createDALLE3Prompt(description: string, primaryKeyword: string): string {
    // Enhance the prompt for DALL-E 3 with specific style guidelines
    const styleGuide = "photorealistic, professional photography, high resolution, clean composition, natural lighting";
    
    // Add context based on the primary keyword
    const contextMap: Record<string, string> = {
      'fitness': 'modern gym environment, athletic wear, professional fitness photography',
      'nutrition': 'fresh healthy food, clean kitchen or dining setting, appetizing food photography',
      'health': 'medical or wellness setting, clean and professional, health-focused imagery',
      'weight': 'fitness transformation, body composition, motivational fitness imagery',
      'muscle': 'bodybuilding, strength training, muscular definition photography',
      'exercise': 'active movement, proper form demonstration, dynamic sports photography',
      'workout': 'gym training, exercise equipment, intense training photography',
      'diet': 'healthy meals, portion control, nutritional food photography'
    };
    
    const context = contextMap[primaryKeyword.toLowerCase()] || 'professional fitness and health imagery';
    
    // Build enhanced prompt
    return `${description}, ${context}, ${styleGuide}, no text or logos in image`;
  }
  
  private extractPrimaryKeyword(title: string): string {
    const cleanTitle = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const words = cleanTitle.split(' ')
      .filter(word => word.length > 3)
      .filter(word => !['with', 'from', 'that', 'this', 'they', 'have', 'will', 'been', 'were', 'your', 'what', 'when', 'where', 'how'].includes(word));
    
    return words[0] || 'fitness';
  }
  
  private parseAIResponse(response: string): { title: string, content: string, metaDescription: string } {
    // Extract title (usually the first line or after "Title:")
    const titleMatch = response.match(/(?:Title:|New Title:|^)(.+?)(?:\n|$)/i);
    let title = titleMatch ? titleMatch[1].trim().replace(/^["']|["']$/g, '') : 'Untitled Article';
    
    // Clean up title - remove any markdown formatting and "Title:" prefix
    title = title
      .replace(/^(Title:|New Title:)\s*/i, '') // Remove "Title:" or "New Title:" prefix
      .replace(/^#+\s+/, '') // Remove leading # symbols
      .replace(/\*\*/g, '') // Remove bold markdown
      .replace(/[`_]/g, '') // Remove backticks and underscores
      .trim();
    
    // Extract meta description
    const metaMatch = response.match(/(?:Meta Description:|Meta:|SEO Description:)(.+?)(?:\n|$)/i);
    const metaDescription = metaMatch ? metaMatch[1].trim().replace(/^["']|["']$/g, '') : '';
    
    // Extract content (everything after the title and before meta description)
    let content = response;
    
    // Remove title section
    if (titleMatch) {
      content = content.replace(titleMatch[0], '');
    }
    
    // Remove meta description section
    if (metaMatch) {
      content = content.replace(metaMatch[0], '');
    }
    
    // Clean up the content
    content = content
      .trim()
      .replace(/^Content:|Article Content:/i, '')
      .trim();
    
    return {
      title,
      content,
      metaDescription: metaDescription || this.generateMetaDescription(title, content)
    };
  }
  
  private enhanceImageDescriptions(content: string, primaryKeyword: string): string {
    // Counter for image variations
    let imageCount = 0;
    
    // Enhanced image placeholder patterns based on context
    const imageContexts = [
      `Photorealistic professional gym interior with state-of-the-art ${primaryKeyword} equipment, bright natural lighting through floor-to-ceiling windows, clean modern design with motivated athletes training in the background`,
      `Athletic man in his 30s demonstrating perfect ${primaryKeyword} form, professional fitness photography with dramatic lighting highlighting muscle definition, wearing high-quality athletic wear in a modern gym setting`,
      `Close-up detailed shot of hands gripping equipment during ${primaryKeyword} exercise, showing proper grip technique and form, professional sports photography with sharp focus and blurred background`,
      `Before and after transformation showing ${primaryKeyword} results, split-screen comparison of the same person, professional photography with consistent lighting and pose, visible muscle development and improved physique`,
      `Professional fitness coach instructing proper ${primaryKeyword} technique to a client, modern gym environment with clear view of form demonstration, engaged interaction between trainer and trainee`,
      `Overhead aerial view of complete ${primaryKeyword} workout setup, organized equipment layout in a professional gym, showing multiple exercise stations and training areas`,
      `Group of diverse athletes performing synchronized ${primaryKeyword} exercises, high-energy fitness class environment, professional photography capturing movement and intensity`,
      `Scientific illustration showing muscle groups activated during ${primaryKeyword}, anatomically accurate diagram with highlighted target areas, clean medical illustration style`,
      `Professional athlete at peak performance during ${primaryKeyword} training, action shot capturing explosive movement, sports photography with motion blur effect on background`,
      `Modern home gym setup optimized for ${primaryKeyword} training, compact but complete equipment arrangement, natural lighting and motivational atmosphere`
    ];
    
    // Replace generic image placeholders with detailed ones for DALL-E
    return content.replace(/!\[(AI Generated Image|DALL-E):([^\]]*)\]/g, (match, prefix, description) => {
      imageCount++;
      
      // Use context-appropriate image description
      const contextIndex = (imageCount - 1) % imageContexts.length;
      let enhancedDescription = imageContexts[contextIndex];
      
      // If the original description has specific details, incorporate them
      const trimmedDesc = description.trim();
      if (trimmedDesc && trimmedDesc.length > 10) {
        // Extract key terms from original description
        const keyTerms = trimmedDesc.toLowerCase();
        
        if (keyTerms.includes('demonstration') || keyTerms.includes('technique')) {
          enhancedDescription = `Professional fitness demonstration showing ${trimmedDesc}, expert athlete with perfect form, multiple angles captured in high-resolution photography, modern gym setting with proper lighting`;
        } else if (keyTerms.includes('results') || keyTerms.includes('transformation')) {
          enhancedDescription = `Impressive ${trimmedDesc} transformation results, before and after comparison photos, professional photography with consistent lighting, visible improvements in muscle definition and overall physique`;
        } else if (keyTerms.includes('equipment') || keyTerms.includes('gear')) {
          enhancedDescription = `Professional photography of ${trimmedDesc}, detailed close-up showing quality and features, clean product photography style with gradient background, multiple angles displayed`;
        } else {
          // Generic enhancement of the original description
          enhancedDescription = `Photorealistic ${trimmedDesc}, professional fitness photography with dramatic lighting, high-quality composition showing proper form and technique, modern training environment`;
        }
      }
      
      return `![DALL-E: ${enhancedDescription}]`;
    });
  }
  
  private generateMetaDescription(title: string, content: string): string {
    // Extract first meaningful sentence from content
    const firstParagraph = content
      .replace(/#### Quick Takeaways[\s\S]*?(?=####|$)/i, '') // Skip takeaways box
      .replace(/<[^>]*>/g, '')
      .trim();
    
    const firstSentence = firstParagraph.split(/[.!?]/)[0];
    
    if (firstSentence && firstSentence.length <= 160) {
      return firstSentence.trim();
    }
    
    // Fallback: Create from title
    const primaryKeyword = this.extractPrimaryKeyword(title);
    return `Discover proven ${primaryKeyword} strategies and expert tips. Get science-backed advice for real results.`.substring(0, 160);
  }
  
  private extractOriginalImages(content: string): string[] {
    const images: string[] = [];
    
    // Extract images from HTML comments
    const commentMatch = content.match(/<!-- AVAILABLE IMAGES:([\s\S]*?)-->/);
    if (commentMatch) {
      const imgMatches = commentMatch[1].matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g);
      for (const match of imgMatches) {
        if (match[1] && match[1].startsWith('http')) {
          images.push(match[1]);
        }
      }
    }
    
    return images;
  }
  
  private distributeOriginalImages(content: string, images: string[], primaryKeyword: string): string {
    if (images.length === 0) return content;
    
    // Split content into sections by headings
    const sections = content.split(/(?=####)/);
    
    // Calculate how many images to place
    const imageInterval = Math.max(2, Math.floor(sections.length / images.length));
    let imageIndex = 0;
    
    // Add images after certain sections
    const updatedSections = sections.map((section, index) => {
      // Add image after every few sections (but not after the first or last)
      if (index > 0 && index < sections.length - 1 && index % imageInterval === 0 && imageIndex < images.length) {
        const imageUrl = images[imageIndex];
        imageIndex++;
        
        // Add the image at the end of the section
        return section + `\n\n![${primaryKeyword} - Professional demonstration](${imageUrl})\n\n`;
      }
      return section;
    });
    
    // If we still have images left, add them throughout the content
    if (imageIndex < images.length) {
      // Find good positions to insert remaining images (after paragraphs)
      let finalContent = updatedSections.join('');
      const remainingImages = images.slice(imageIndex);
      
      // Insert remaining images after substantial paragraphs
      const paragraphs = finalContent.split('\n\n');
      const paragraphInterval = Math.max(3, Math.floor(paragraphs.length / remainingImages.length));
      
      for (let i = 0; i < remainingImages.length && i * paragraphInterval < paragraphs.length; i++) {
        const insertIndex = (i + 1) * paragraphInterval;
        if (insertIndex < paragraphs.length - 1) {
          paragraphs[insertIndex] += `\n\n![${primaryKeyword} technique demonstration](${remainingImages[i]})`;
        }
      }
      
      return paragraphs.join('\n\n');
    }
    
    return updatedSections.join('');
  }
}