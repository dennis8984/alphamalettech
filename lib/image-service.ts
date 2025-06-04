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
        per_page: '10',
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
   * Get optimized image for article content
   */
  static async getArticleImage(
    articleTitle: string, 
    category: string, 
    excerpt: string
  ): Promise<string> {
    // Generate smart search query from article content
    const searchQuery = this.generateImageSearchQuery(articleTitle, category, excerpt);
    
    console.log(`🖼️ Searching for image with query: "${searchQuery}"`);
    
    const images = await this.searchImages({
      query: searchQuery,
      orientation: 'landscape',
      size: 'regular'
    });

    if (images.length > 0) {
      const selectedImage = images[0];
      console.log(`✅ Found image: ${selectedImage.alt_description || 'No description'}`);
      return selectedImage.urls.regular;
    }

    // Fallback to category-based search
    const categoryImages = await this.searchImages({
      query: `${category} fitness health men`,
      orientation: 'landscape'
    });

    if (categoryImages.length > 0) {
      return categoryImages[0].urls.regular;
    }

    // Ultimate fallback
    return 'https://images.pexels.com/photos/1547248/pexels-photo-1547248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  }

  /**
   * Generate smart search query from article content
   */
  private static generateImageSearchQuery(title: string, category: string, excerpt: string): string {
    // Extract key terms from title and excerpt
    const content = `${title} ${excerpt}`.toLowerCase();
    
    // Men's Health specific keywords
    const fitnessKeywords = ['workout', 'exercise', 'gym', 'training', 'muscle', 'strength', 'cardio'];
    const nutritionKeywords = ['diet', 'protein', 'nutrition', 'healthy', 'food', 'meal'];
    const healthKeywords = ['health', 'wellness', 'medical', 'doctor', 'study', 'research'];
    const styleKeywords = ['style', 'fashion', 'grooming', 'clothing', 'appearance'];
    
    const foundKeywords: string[] = [];
    
    // Find relevant keywords
    [...fitnessKeywords, ...nutritionKeywords, ...healthKeywords, ...styleKeywords]
      .forEach(keyword => {
        if (content.includes(keyword)) {
          foundKeywords.push(keyword);
        }
      });

    // Build search query
    const baseTerms = foundKeywords.slice(0, 3); // Top 3 relevant terms
    const categoryTerm = category.replace('-', ' ');
    
    // Add "man" or "men" for Men's Health context
    const query = [...baseTerms, categoryTerm, 'man'].join(' ');
    
    return query;
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
      'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
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

  /**
   * Extract image descriptions from article content
   */
  static extractImageDescriptions(content: string): string[] {
    const descriptions: string[] = [];
    
    // Look for existing image tags with alt text
    const imgRegex = /<img[^>]+alt=["']([^"']+)["'][^>]*>/gi;
    let match;
    
    while ((match = imgRegex.exec(content)) !== null) {
      descriptions.push(match[1]);
    }

    // Look for figure captions
    const figcaptionRegex = /<figcaption[^>]*>([^<]+)<\/figcaption>/gi;
    while ((match = figcaptionRegex.exec(content)) !== null) {
      descriptions.push(match[1]);
    }

    // Generate descriptions for image placeholders
    const placeholderRegex = /\{IMAGE_URL\}/gi;
    const placeholderCount = (content.match(placeholderRegex) || []).length;
    
    if (placeholderCount > descriptions.length) {
      // Generate additional descriptions based on content
      descriptions.push('Man demonstrating proper exercise technique');
      descriptions.push('Healthy meal preparation');
      descriptions.push('Professional fitness equipment');
      descriptions.push('Men\'s health lifestyle');
    }

    return descriptions;
  }

  /**
   * Replace image placeholders with actual images
   */
  static async replaceImagePlaceholders(
    content: string, 
    articleTitle: string, 
    category: string
  ): Promise<string> {
    const descriptions = this.extractImageDescriptions(content);
    let updatedContent = content;
    let placeholderIndex = 0;

    // Replace {IMAGE_URL} placeholders
    const placeholderRegex = /\{IMAGE_URL\}/g;
    const placeholders = content.match(placeholderRegex) || [];

    for (const placeholder of placeholders) {
      const description = descriptions[placeholderIndex] || `${category} men's health`;
      const imageUrl = await this.getArticleImage(
        `${articleTitle} ${description}`, 
        category, 
        description
      );
      
      updatedContent = updatedContent.replace(placeholder, imageUrl);
      placeholderIndex++;
    }

    console.log(`🖼️ Replaced ${placeholders.length} image placeholders`);
    return updatedContent;
  }
} 