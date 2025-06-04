interface AuthorityLink {
  text: string
  url: string
  type: 'government' | 'education' | 'research' | 'medical'
  confidence: number
}

interface LinkDetectionResult {
  originalText: string
  linkedText: string
  linksAdded: AuthorityLink[]
}

export class AuthorityLinkDetector {
  
  /**
   * Detect and link authority sources in article content
   */
  static async detectAndLinkAuthorities(content: string): Promise<LinkDetectionResult> {
    console.log('🔍 Scanning content for authority sources...');
    
    const detectedSources = this.extractAuthoritySources(content);
    const linkedSources: AuthorityLink[] = [];
    let updatedContent = content;

    for (const source of detectedSources) {
      const authorityLink = await this.findAuthorityLink(source);
      
      if (authorityLink) {
        // Replace the mention with a linked version
        const linkedText = `<a href="${authorityLink.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${source}</a>`;
        updatedContent = updatedContent.replace(source, linkedText);
        linkedSources.push(authorityLink);
        console.log(`✅ Linked: ${source} → ${authorityLink.url}`);
      }
    }

    return {
      originalText: content,
      linkedText: updatedContent,
      linksAdded: linkedSources
    };
  }

  /**
   * Extract potential authority sources from content
   */
  private static extractAuthoritySources(content: string): string[] {
    const sources: Set<string> = new Set();
    
    // Government agencies and departments
    const govPattern = /\b(CDC|FDA|NIH|WHO|Department of Health|Centers for Disease Control|National Institutes of Health|Food and Drug Administration|World Health Organization|USDA|American Heart Association|Mayo Clinic)\b/gi;
    const govMatches = content.match(govPattern) || [];
    govMatches.forEach(match => sources.add(match));

    // Universities and research institutions
    const eduPattern = /\b(Harvard|Stanford|MIT|Yale|Princeton|Berkeley|UCLA|University of [A-Z][a-z]+|[A-Z][a-z]+ University|Johns Hopkins|Cleveland Clinic)\b/gi;
    const eduMatches = content.match(eduPattern) || [];
    eduMatches.forEach(match => sources.add(match));

    // Journal mentions
    const journalPattern = /\b(Journal of [A-Z][a-zA-Z\s]+|American Journal of [A-Z][a-zA-Z\s]+|The Lancet|Nature|Science|NEJM|New England Journal of Medicine|JAMA|BMJ|PLoS ONE)\b/gi;
    const journalMatches = content.match(journalPattern) || [];
    journalMatches.forEach(match => sources.add(match));

    // Study mentions
    const studyPattern = /\b(study published in|research from|according to a study|researchers at|scientists at|study conducted by)\s+([A-Z][a-zA-Z\s]+(?:University|Institute|College|Center|Clinic))/gi;
    let studyMatch;
    while ((studyMatch = studyPattern.exec(content)) !== null) {
      sources.add(studyMatch[2].trim());
    }

    return Array.from(sources);
  }

  /**
   * Find the actual authority link for a source
   */
  private static async findAuthorityLink(source: string): Promise<AuthorityLink | null> {
    // Try known mappings first
    const knownLink = this.getKnownAuthorityLink(source);
    if (knownLink) {
      return knownLink;
    }

    // If no known mapping, try web search
    return await this.searchForAuthorityLink(source);
  }

  /**
   * Get known authority links for common sources
   */
  private static getKnownAuthorityLink(source: string): AuthorityLink | null {
    const sourceMap: Record<string, AuthorityLink> = {
      'CDC': {
        text: 'CDC',
        url: 'https://www.cdc.gov',
        type: 'government',
        confidence: 1.0
      },
      'Centers for Disease Control': {
        text: 'Centers for Disease Control',
        url: 'https://www.cdc.gov',
        type: 'government',
        confidence: 1.0
      },
      'FDA': {
        text: 'FDA',
        url: 'https://www.fda.gov',
        type: 'government',
        confidence: 1.0
      },
      'Food and Drug Administration': {
        text: 'Food and Drug Administration',
        url: 'https://www.fda.gov',
        type: 'government',
        confidence: 1.0
      },
      'NIH': {
        text: 'NIH',
        url: 'https://www.nih.gov',
        type: 'government',
        confidence: 1.0
      },
      'National Institutes of Health': {
        text: 'National Institutes of Health',
        url: 'https://www.nih.gov',
        type: 'government',
        confidence: 1.0
      },
      'WHO': {
        text: 'WHO',
        url: 'https://www.who.int',
        type: 'government',
        confidence: 1.0
      },
      'World Health Organization': {
        text: 'World Health Organization',
        url: 'https://www.who.int',
        type: 'government',
        confidence: 1.0
      },
      'USDA': {
        text: 'USDA',
        url: 'https://www.usda.gov',
        type: 'government',
        confidence: 1.0
      },
      'American Heart Association': {
        text: 'American Heart Association',
        url: 'https://www.heart.org',
        type: 'medical',
        confidence: 1.0
      },
      'Mayo Clinic': {
        text: 'Mayo Clinic',
        url: 'https://www.mayoclinic.org',
        type: 'medical',
        confidence: 1.0
      },
      'Harvard': {
        text: 'Harvard',
        url: 'https://www.harvard.edu',
        type: 'education',
        confidence: 1.0
      },
      'Stanford': {
        text: 'Stanford',
        url: 'https://www.stanford.edu',
        type: 'education',
        confidence: 1.0
      },
      'MIT': {
        text: 'MIT',
        url: 'https://www.mit.edu',
        type: 'education',
        confidence: 1.0
      },
      'Johns Hopkins': {
        text: 'Johns Hopkins',
        url: 'https://www.jhu.edu',
        type: 'education',
        confidence: 1.0
      },
      'The Lancet': {
        text: 'The Lancet',
        url: 'https://www.thelancet.com',
        type: 'research',
        confidence: 1.0
      },
      'Nature': {
        text: 'Nature',
        url: 'https://www.nature.com',
        type: 'research',
        confidence: 1.0
      },
      'NEJM': {
        text: 'NEJM',
        url: 'https://www.nejm.org',
        type: 'research',
        confidence: 1.0
      },
      'New England Journal of Medicine': {
        text: 'New England Journal of Medicine',
        url: 'https://www.nejm.org',
        type: 'research',
        confidence: 1.0
      },
      'JAMA': {
        text: 'JAMA',
        url: 'https://jamanetwork.com',
        type: 'research',
        confidence: 1.0
      }
    };

    const normalizedSource = source.trim();
    return sourceMap[normalizedSource] || null;
  }

  /**
   * Search for authority link using web search (fallback)
   */
  private static async searchForAuthorityLink(source: string): Promise<AuthorityLink | null> {
    try {
      // Construct search query for authority sources
      const searchQuery = `${source} site:.gov OR site:.edu OR site:.org official`;
      
      console.log(`🌐 Searching for: ${searchQuery}`);
      
      // In a real implementation, you would use a web search API like:
      // - Google Custom Search API
      // - Bing Search API
      // - SerpAPI
      
      // For now, return null (no search performed)
      // This can be extended with actual web search integration
      
      return null;
    } catch (error) {
      console.error('🚨 Authority link search failed:', error);
      return null;
    }
  }

  /**
   * Generate prompt for finding authority sources
   */
  static generateAuthorityLinkPrompt(content: string): string {
    return `
TASK: Find and link authority sources in this article content.

ARTICLE CONTENT:
${content}

INSTRUCTIONS:
1. Scan the content for mentions of:
   - Government agencies (CDC, FDA, NIH, WHO, etc.)
   - Educational institutions (Harvard, Stanford, Johns Hopkins, etc.)
   - Medical organizations (Mayo Clinic, American Heart Association, etc.)
   - Research journals (The Lancet, Nature, NEJM, JAMA, etc.)
   - Research studies or peer-reviewed sources

2. For each mention found:
   - Identify the exact text to be linked
   - Find the official website URL (.gov, .edu, or authoritative .org)
   - Verify the link is to the official source
   - Ensure the link is relevant to the context

3. Return results in this format:
   - Original text: [exact text found]
   - Link URL: [official website]
   - Type: [government|education|medical|research]
   - Context: [surrounding sentence for verification]

REQUIREMENTS:
- Only link to official, authoritative sources
- Prefer .gov and .edu domains
- For medical organizations, use their official .org sites
- For journals, link to the official publication websites
- Ensure links are contextually relevant

OUTPUT FORMAT:
[
  {
    "text": "CDC",
    "url": "https://www.cdc.gov",
    "type": "government",
    "context": "According to the CDC, regular exercise..."
  }
]
`;
  }

  /**
   * Validate if a URL is an authority source
   */
  static isAuthoritySource(url: string): boolean {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      // Government domains
      if (domain.endsWith('.gov')) return true;
      
      // Educational institutions
      if (domain.endsWith('.edu')) return true;
      
      // Known authority organizations
      const authorityDomains = [
        'who.int',
        'heart.org',
        'mayoclinic.org',
        'thelancet.com',
        'nature.com',
        'nejm.org',
        'jamanetwork.com',
        'bmj.com',
        'plos.org'
      ];
      
      return authorityDomains.some(authDomain => 
        domain === authDomain || domain.endsWith(`.${authDomain}`)
      );
    } catch {
      return false;
    }
  }
} 