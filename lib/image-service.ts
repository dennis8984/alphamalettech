interface ImageSearchOptions {
  query: string
  orientation?: 'landscape' | 'portrait' | 'squarish'
  size?: 'small' | 'regular' | 'full'
  color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue'
}

interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    username: string
  }
  links: {
    html: string
  }
}

interface ImageContext {
  surroundingText: string
  sectionHeading?: string
  articleTitle: string
  category: string
  imageIndex: number
  usedImageIds: Set<string>
}

export class ImageService {
  private static readonly UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || ''
  private static readonly BASE_URL = 'https://api.unsplash.com'
  
  /**
   * Search for images based on content description
   */
  static async searchImages(options: ImageSearchOptions): Promise<UnsplashImage[]> {
    if (!this.UNSPLASH_ACCESS_KEY) {
      console.warn('🚨 Unsplash Access Key not configured, using fallback images');
      return this.getFallbackImages(options.query);
    }

    try {
      const params = new URLSearchParams({
        query: options.query,
        orientation: options.orientation || 'landscape',
        per_page: '20', // Get more options for variety
        order_by: 'relevance'
      });

      if (options.color) {
        params.append('color', options.color);
      }

      const response = await fetch(`${this.BASE_URL}/search/photos?${params}`, {
        headers: {
          'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('🚨 Image search failed:', error);
      return this.getFallbackImages(options.query);
    }
  }

  /**
   * Get optimized image for article content with context awareness
   */
  static async getContextualImage(context: ImageContext): Promise<string> {
    // Generate context-specific search query
    const searchQuery = this.generateContextualSearchQuery(context);
    
    console.log(`🖼️ Searching for contextual image ${context.imageIndex + 1} with query: "${searchQuery}"`);
    
    const images = await this.searchImages({
      query: searchQuery,
      orientation: 'landscape',
      size: 'regular'
    });

    // Filter out already used images in this article
    const availableImages = images.filter(img => !context.usedImageIds.has(img.id));
    
    if (availableImages.length > 0) {
      // Select image based on position in article
      const selectedImage = this.selectImageByPosition(availableImages, context.imageIndex);
      context.usedImageIds.add(selectedImage.id);
      console.log(`✅ Found contextual image: ${selectedImage.alt_description || 'No description'}`);
      return selectedImage.urls.regular;
    }

    // Fallback to broader search if no unique images found
    const fallbackQuery = this.generateFallbackQuery(context);
    console.log(`🔄 Trying fallback query: "${fallbackQuery}"`);
    
    const fallbackImages = await this.searchImages({
      query: fallbackQuery,
      orientation: 'landscape'
    });

    const availableFallbacks = fallbackImages.filter(img => !context.usedImageIds.has(img.id));
    
    if (availableFallbacks.length > 0) {
      const selectedImage = availableFallbacks[0];
      context.usedImageIds.add(selectedImage.id);
      return selectedImage.urls.regular;
    }

    // Ultimate fallback to category-based image
    return this.getCategoryFallbackImage(context.category, context.imageIndex);
  }

  /**
   * Generate context-specific search query based on surrounding content
   */
  private static generateContextualSearchQuery(context: ImageContext): string {
    const { surroundingText, sectionHeading, articleTitle, category, imageIndex } = context;
    
    // Extract key concepts from surrounding text
    const textToAnalyze = `${sectionHeading || ''} ${surroundingText}`.toLowerCase();
    
    // Define context-specific keywords for different topics
    const contextKeywords = {
      // Caffeine/Energy specific
      coffee: ['coffee', 'espresso', 'cappuccino', 'latte', 'beans', 'brewing'],
      energy: ['energy drink', 'supplement', 'pre-workout', 'powder', 'bottle'],
      workout: ['gym', 'exercise', 'training', 'weights', 'treadmill', 'fitness'],
      heart: ['heart', 'cardiac', 'pulse', 'blood pressure', 'medical', 'hospital'],
      research: ['lab', 'scientist', 'study', 'research', 'data', 'graph'],
      lifestyle: ['lifestyle', 'daily', 'morning', 'routine', 'healthy'],
      
      // General health/fitness
      nutrition: ['nutrition', 'diet', 'food', 'meal', 'healthy eating'],
      health: ['health', 'wellness', 'medical', 'doctor', 'clinic'],
      fitness: ['fitness', 'exercise', 'gym', 'workout', 'training'],
      muscle: ['muscle', 'strength', 'bodybuilding', 'weights', 'physique']
    };

    // Find relevant context keywords
    const foundContexts: string[] = [];
    Object.entries(contextKeywords).forEach(([context, keywords]) => {
      if (keywords.some(keyword => textToAnalyze.includes(keyword))) {
        foundContexts.push(context);
      }
    });

    // Build specific search query based on found contexts
    let searchTerms: string[] = [];
    
    if (foundContexts.includes('coffee')) {
      searchTerms = ['coffee', 'caffeine', 'espresso', 'morning'];
    } else if (foundContexts.includes('energy')) {
      searchTerms = ['energy drink', 'supplement', 'nutrition'];
    } else if (foundContexts.includes('heart')) {
      searchTerms = ['medical', 'health', 'cardiology', 'stethoscope'];
    } else if (foundContexts.includes('research')) {
      searchTerms = ['laboratory', 'research', 'science', 'data'];
    } else if (foundContexts.includes('workout')) {
      searchTerms = ['gym', 'fitness', 'exercise', 'training'];
    } else {
      // Default based on article category and position
      searchTerms = this.getDefaultSearchTerms(category, imageIndex);
    }

    // Add diversity based on image position
    const diversityTerms = this.getDiversityTerms(imageIndex);
    
    return [...searchTerms, ...diversityTerms, 'professional'].join(' ');
  }

  /**
   * Get default search terms based on category and position
   */
  private static getDefaultSearchTerms(category: string, imageIndex: number): string[] {
    const categoryMap: Record<string, string[][]> = {
      health: [
        ['health', 'medical', 'wellness'],
        ['doctor', 'stethoscope', 'clinic'],
        ['lifestyle', 'healthy', 'nutrition'],
        ['research', 'laboratory', 'science']
      ],
      fitness: [
        ['gym', 'workout', 'exercise'],
        ['weights', 'strength', 'training'],
        ['cardio', 'running', 'fitness'],
        ['athlete', 'sport', 'performance']
      ],
      nutrition: [
        ['healthy food', 'nutrition', 'diet'],
        ['vegetables', 'protein', 'meal'],
        ['cooking', 'kitchen', 'ingredients'],
        ['supplement', 'vitamins', 'nutrition']
      ]
    };

    const terms = categoryMap[category] || categoryMap.health;
    return terms[imageIndex % terms.length];
  }

  /**
   * Add diversity terms based on image position
   */
  private static getDiversityTerms(imageIndex: number): string[] {
    const diversityOptions = [
      ['man', 'male'],
      ['person', 'people'],
      ['professional', 'expert'],
      ['modern', 'contemporary'],
      ['lifestyle', 'daily'],
      ['indoor', 'studio'],
      ['outdoor', 'natural'],
      ['close-up', 'detailed']
    ];

    return diversityOptions[imageIndex % diversityOptions.length];
  }

  /**
   * Select image based on position to ensure variety
   */
  private static selectImageByPosition(images: UnsplashImage[], imageIndex: number): UnsplashImage {
    // Distribute images across the available options
    const selectedIndex = imageIndex % Math.min(images.length, 5);
    return images[selectedIndex];
  }

  /**
   * Generate fallback query when specific search fails
   */
  private static generateFallbackQuery(context: ImageContext): string {
    const categoryTerms: Record<string, string> = {
      health: 'health wellness medical',
      fitness: 'fitness gym exercise',
      nutrition: 'nutrition healthy food',
      style: 'lifestyle fashion style',
      'weight-loss': 'fitness health wellness',
      entertainment: 'lifestyle modern'
    };

    return categoryTerms[context.category] || 'health fitness wellness';
  }

  /**
   * Get category-based fallback image
   */
  private static getCategoryFallbackImage(category: string, imageIndex: number): string {
    const fallbackUrls = [
      'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ];

    return fallbackUrls[imageIndex % fallbackUrls.length];
  }

  /**
   * Get optimized image for article content (legacy method for backward compatibility)
   */
  static async getArticleImage(
    articleTitle: string, 
    category: string, 
    excerpt: string
  ): Promise<string> {
    const context: ImageContext = {
      surroundingText: excerpt,
      articleTitle,
      category,
      imageIndex: 0,
      usedImageIds: new Set()
    };

    return this.getContextualImage(context);
  }

  /**
   * Extract image descriptions and contexts from article content
   */
  static extractImageContexts(content: string, articleTitle: string, category: string): ImageContext[] {
    const contexts: ImageContext[] = [];
    const usedImageIds = new Set<string>();
    
    // Find all image placeholders and their surrounding context
    const placeholderRegex = /\{IMAGE_URL\}/g;
    let match;
    let imageIndex = 0;

    while ((match = placeholderRegex.exec(content)) !== null) {
      const position = match.index;
      
      // Get surrounding context (200 chars before and after)
      const contextStart = Math.max(0, position - 200);
      const contextEnd = Math.min(content.length, position + 200);
      const surroundingText = content.substring(contextStart, contextEnd);
      
      // Find the nearest heading before this image
      const headingRegex = /<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g;
      let nearestHeading = '';
      let headingMatch;
      
      // Reset regex and find headings before current position
      headingRegex.lastIndex = 0;
      while ((headingMatch = headingRegex.exec(content)) !== null) {
        if (headingMatch.index < position) {
          nearestHeading = headingMatch[1];
        } else {
          break;
        }
      }

      contexts.push({
        surroundingText: surroundingText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
        sectionHeading: nearestHeading,
        articleTitle,
        category,
        imageIndex,
        usedImageIds
      });

      imageIndex++;
    }

    return contexts;
  }

  /**
   * Replace image placeholders with contextually relevant images
   */
  static async replaceImagePlaceholders(
    content: string, 
    articleTitle: string, 
    category: string
  ): Promise<string> {
    const contexts = this.extractImageContexts(content, articleTitle, category);
    let updatedContent = content;
    
    console.log(`🖼️ Processing ${contexts.length} images with contextual awareness`);

    // Process each image placeholder with its context
    for (let i = 0; i < contexts.length; i++) {
      const context = contexts[i];
      
      try {
        const imageUrl = await this.getContextualImage(context);
        
        // Replace only the first remaining placeholder
        updatedContent = updatedContent.replace('{IMAGE_URL}', imageUrl);
        
        console.log(`✅ Replaced image ${i + 1}/${contexts.length} with contextual search`);
      } catch (error) {
        console.error(`🚨 Failed to get contextual image ${i + 1}:`, error);
        
        // Fallback to category image
        const fallbackUrl = this.getCategoryFallbackImage(category, i);
        updatedContent = updatedContent.replace('{IMAGE_URL}', fallbackUrl);
      }
      
      // Small delay to respect API rate limits
      if (i < contexts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`🖼️ Completed ${contexts.length} contextual image replacements`);
    return updatedContent;
  }

  /**
   * Fallback images when API is unavailable
   */
  private static getFallbackImages(query: string): UnsplashImage[] {
    const fallbackUrls = [
      'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
    ];

    return fallbackUrls.map((url, index) => ({
      id: `fallback-${index}`,
      urls: {
        raw: url,
        full: url,
        regular: url,
        small: url,
        thumb: url
      },
      alt_description: `${query} image`,
      description: `Fallback image for ${query}`,
      user: {
        name: 'Stock Photo',
        username: 'stock'
      },
      links: {
        html: '#'
      }
    }));
  }
} 