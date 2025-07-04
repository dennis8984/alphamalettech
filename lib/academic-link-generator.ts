interface AcademicSource {
  name: string;
  url: string;
  topics: string[];
}

const academicSources: AcademicSource[] = [
  // Medical and Health Research
  {
    name: 'National Institutes of Health',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/',
    topics: ['health', 'medical', 'disease', 'treatment', 'research', 'clinical']
  },
  {
    name: 'Harvard Medical School',
    url: 'https://www.health.harvard.edu/',
    topics: ['health', 'medical', 'wellness', 'prevention', 'disease']
  },
  {
    name: 'Mayo Clinic',
    url: 'https://www.mayoclinic.org/',
    topics: ['health', 'symptoms', 'treatment', 'medical', 'conditions']
  },
  {
    name: 'Cleveland Clinic',
    url: 'https://my.clevelandclinic.org/',
    topics: ['health', 'heart', 'medical', 'treatment', 'wellness']
  },
  
  // Fitness and Exercise Science
  {
    name: 'American College of Sports Medicine',
    url: 'https://www.acsm.org/',
    topics: ['exercise', 'fitness', 'sports', 'training', 'physical activity']
  },
  {
    name: 'National Strength and Conditioning Association',
    url: 'https://www.nsca.com/',
    topics: ['strength', 'conditioning', 'training', 'exercise', 'performance']
  },
  {
    name: 'Journal of Strength and Conditioning Research',
    url: 'https://journals.lww.com/nsca-jscr/',
    topics: ['strength', 'conditioning', 'research', 'exercise', 'training']
  },
  
  // Nutrition Science
  {
    name: 'Academy of Nutrition and Dietetics',
    url: 'https://www.eatright.org/',
    topics: ['nutrition', 'diet', 'food', 'eating', 'dietetics']
  },
  {
    name: 'American Journal of Clinical Nutrition',
    url: 'https://academic.oup.com/ajcn',
    topics: ['nutrition', 'clinical', 'diet', 'research', 'food']
  },
  {
    name: 'Harvard T.H. Chan School of Public Health',
    url: 'https://www.hsph.harvard.edu/nutritionsource/',
    topics: ['nutrition', 'diet', 'health', 'food', 'eating']
  },
  
  // Psychology and Mental Health
  {
    name: 'American Psychological Association',
    url: 'https://www.apa.org/',
    topics: ['psychology', 'mental', 'stress', 'anxiety', 'depression']
  },
  {
    name: 'National Institute of Mental Health',
    url: 'https://www.nimh.nih.gov/',
    topics: ['mental', 'health', 'psychology', 'anxiety', 'depression']
  },
  
  // Specific Health Topics
  {
    name: 'American Heart Association',
    url: 'https://www.heart.org/',
    topics: ['heart', 'cardiovascular', 'blood pressure', 'cholesterol', 'cardiac']
  },
  {
    name: 'American Diabetes Association',
    url: 'https://diabetes.org/',
    topics: ['diabetes', 'blood sugar', 'insulin', 'glucose', 'metabolic']
  },
  {
    name: 'Sleep Foundation',
    url: 'https://www.sleepfoundation.org/',
    topics: ['sleep', 'insomnia', 'rest', 'recovery', 'circadian']
  },
  {
    name: 'Arthritis Foundation',
    url: 'https://www.arthritis.org/',
    topics: ['arthritis', 'joint', 'pain', 'inflammation', 'mobility']
  }
];

export function generateAcademicLinks(content: string, primaryKeyword: string): string {
  // Extract key topics from content
  const contentLower = content.toLowerCase();
  const relevantSources: AcademicSource[] = [];
  
  // Find relevant academic sources based on content
  academicSources.forEach(source => {
    const matchCount = source.topics.filter(topic => 
      contentLower.includes(topic)
    ).length;
    
    if (matchCount > 0) {
      relevantSources.push(source);
    }
  });
  
  // Sort by relevance (most topic matches first)
  relevantSources.sort((a, b) => {
    const aMatches = a.topics.filter(topic => contentLower.includes(topic)).length;
    const bMatches = b.topics.filter(topic => contentLower.includes(topic)).length;
    return bMatches - aMatches;
  });
  
  // Select top 2-3 most relevant sources
  const selectedSources = relevantSources.slice(0, 3);
  
  // If no relevant sources found, add general health sources
  if (selectedSources.length === 0) {
    selectedSources.push(
      academicSources.find(s => s.name === 'National Institutes of Health')!,
      academicSources.find(s => s.name === 'Harvard Medical School')!
    );
  }
  
  // Add academic reference section at the end of content
  if (selectedSources.length > 0) {
    const referenceSection = `

<div class="bg-gray-50 p-6 rounded-lg mt-12">
  <h3 class="text-lg font-bold text-gray-900 mb-4">Scientific References & Further Reading</h3>
  <p class="text-gray-700 mb-4">For more evidence-based information on ${primaryKeyword}, consult these authoritative sources:</p>
  <ul class="space-y-2">
${selectedSources.map(source => `    <li class="text-gray-700">
      <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium">
        ${source.name}
      </a> - Leading research and clinical guidelines
    </li>`).join('\n')}
  </ul>
  <p class="text-sm text-gray-600 mt-4 italic">Always consult with healthcare professionals before making significant changes to your health routine.</p>
</div>`;
    
    // Add the reference section before the FAQ section if it exists
    const faqMatch = content.match(/<h2[^>]*>(?:Frequently Asked Questions|FAQ)/i);
    if (faqMatch) {
      // Insert before FAQ
      return content.replace(faqMatch[0], referenceSection + '\n\n' + faqMatch[0]);
    } else {
      // Add at the end
      return content + referenceSection;
    }
  }
  
  return content;
}

// Function to add inline academic citations
export function addInlineAcademicLinks(content: string): string {
  // Add links for specific health claims
  const healthClaims = [
    {
      pattern: /(?:research shows?|studies show?|evidence suggests?|scientists? (?:have )?found)/gi,
      link: 'https://www.ncbi.nlm.nih.gov/pmc/',
      text: 'research'
    },
    {
      pattern: /(?:according to|based on) (?:recent )?studies/gi,
      link: 'https://www.ncbi.nlm.nih.gov/pmc/',
      text: 'studies'
    },
    {
      pattern: /clinical trials?/gi,
      link: 'https://clinicaltrials.gov/',
      text: 'clinical trials'
    },
    {
      pattern: /peer[- ]reviewed/gi,
      link: 'https://www.ncbi.nlm.nih.gov/pmc/',
      text: 'peer-reviewed'
    }
  ];
  
  let enhancedContent = content;
  
  // Add inline links for research mentions
  healthClaims.forEach(claim => {
    let count = 0;
    enhancedContent = enhancedContent.replace(claim.pattern, (match) => {
      count++;
      // Only link the first 2 occurrences to avoid over-linking
      if (count <= 2) {
        return match.replace(claim.text, `<a href="${claim.link}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${claim.text}</a>`);
      }
      return match;
    });
  });
  
  return enhancedContent;
}