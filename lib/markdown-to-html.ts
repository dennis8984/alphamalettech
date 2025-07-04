export function convertMarkdownToHtml(markdown: string): string {
  let html = markdown;
  
  // First, clean up any markdown artifacts
  html = html.replace(/^---+$/gm, ''); // Remove horizontal rules
  html = html.replace(/\*\*\s*\*\*/g, ''); // Remove empty bold markers
  html = html.replace(/\*\*---\*\*/g, ''); // Remove bold horizontal rules
  
  // Convert headers (#### = h2, ### = h3, ## = h4)
  html = html.replace(/^####\s+(.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">$1</h2>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-10 mb-4">$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h4 class="text-lg font-bold text-gray-900 mt-8 mb-3">$1</h4>');
  
  // Also handle headers that might not be at start of line
  html = html.replace(/####\s+(.+)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">$1</h2>');
  html = html.replace(/###\s+(.+)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-10 mb-4">$1</h3>');
  html = html.replace(/##\s+(.+)$/gm, '<h4 class="text-lg font-bold text-gray-900 mt-8 mb-3">$1</h4>');
  
  // Convert bold text
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic text (single asterisk, but not part of lists)
  html = html.replace(/(?<!\n)\*([^*\n]+?)\*/g, '<em>$1</em>');
  
  // Convert lists
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Check for unordered list items
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const listItem = trimmedLine.substring(2);
      if (!inList || listType !== 'ul') {
        if (inList && listType === 'ol') {
          processedLines.push('</ol>');
        }
        processedLines.push('<ul class="space-y-3 text-gray-700 my-6">');
        inList = true;
        listType = 'ul';
      }
      processedLines.push(`  <li class="flex items-start"><span class="text-red-600 font-bold mr-3">•</span><span class="leading-relaxed">${listItem}</span></li>`);
    }
    // Check for ordered list items
    else if (/^\d+\.\s+/.test(trimmedLine)) {
      const listItem = trimmedLine.replace(/^\d+\.\s+/, '');
      if (!inList || listType !== 'ol') {
        if (inList && listType === 'ul') {
          processedLines.push('</ul>');
        }
        processedLines.push('<ol class="space-y-3 text-gray-700 my-6 list-decimal list-inside">');
        inList = true;
        listType = 'ol';
      }
      processedLines.push(`  <li class="leading-relaxed">${listItem}</li>`);
    }
    // Handle end of list
    else {
      if (inList && trimmedLine === '') {
        processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      processedLines.push(line);
    }
  }
  
  // Close any open lists at the end
  if (inList) {
    processedLines.push(listType === 'ul' ? '</ul>' : '</ol>');
  }
  
  html = processedLines.join('\n');
  
  // Convert Quick Takeaways box
  html = html.replace(
    /#### Quick Takeaways\n([\s\S]*?)(?=\n####|\n\n####|$)/,
    (match, content) => {
      const takeaways = content.trim().split('\n')
        .filter((line: string) => line.trim().startsWith('-') || line.trim().startsWith('*'))
        .map((line: string) => line.trim().substring(2).trim());
      
      if (takeaways.length === 0) return match;
      
      return `<div class="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-r-lg">
  <h3 class="text-lg font-bold text-red-900 mb-4">Quick Takeaways</h3>
  <ul class="space-y-3 text-red-800">
${takeaways.map((takeaway: string) => `    <li class="flex items-start"><span class="text-red-600 font-bold mr-3">•</span><span class="leading-relaxed">${takeaway}</span></li>`).join('\n')}
  </ul>
</div>`;
    }
  );
  
  // Handle images with proper formatting
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    // Check if it's a real URL or a placeholder
    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
      return `
<figure class="my-8">
  <img src="${src}" alt="${alt}" class="w-full rounded-lg shadow-lg">
  ${alt ? `<figcaption class="text-center text-gray-600 text-sm mt-3 italic">${alt}</figcaption>` : ''}
</figure>`;
    }
    // For DALL-E placeholders, use a stock fitness image
    return `
<figure class="my-8">
  <img src="https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop" alt="${alt}" class="w-full rounded-lg shadow-lg">
  ${alt ? `<figcaption class="text-center text-gray-600 text-sm mt-3 italic">${alt}</figcaption>` : ''}
</figure>`;
  });
  
  // Also handle DALL-E placeholders without parentheses (just ![DALL-E: description])
  html = html.replace(/!\[DALL-E:\s*([^\]]+)\]/g, (match, description) => {
    // Use stock images for DALL-E placeholders
    const stockImages = [
      'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg',
      'https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg',
      'https://images.pexels.com/photos/3837389/pexels-photo-3837389.jpeg',
      'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg',
      'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg'
    ];
    
    // Use a different stock image based on the description hash
    const imageIndex = description.length % stockImages.length;
    const stockImage = stockImages[imageIndex];
    
    return `
<figure class="my-8">
  <img src="${stockImage}?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop" alt="${description.trim()}" class="w-full rounded-lg shadow-lg">
  <figcaption class="text-center text-gray-600 text-sm mt-3 italic">Professional fitness demonstration</figcaption>
</figure>`;
  });
  
  // Convert paragraphs (lines not already tagged)
  html = html.split('\n\n').map((para: string) => {
    const trimmed = para.trim();
    if (trimmed && 
        !trimmed.includes('<h') && 
        !trimmed.includes('<ul') && 
        !trimmed.includes('<ol') && 
        !trimmed.includes('<li') &&
        !trimmed.includes('</ul>') &&
        !trimmed.includes('</ol>') &&
        !trimmed.includes('<div') &&
        !trimmed.includes('</div>') &&
        !trimmed.includes('<figure') &&
        !trimmed.includes('![')) {
      // Check if it starts with special formatting
      if (trimmed.startsWith('#### ') || trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
        return para; // Already handled by header conversion
      }
      return `<p class="mb-6 text-gray-700 leading-relaxed">${trimmed}</p>`;
    }
    return para;
  }).join('\n\n');
  
  // Clean up any empty paragraphs
  html = html.replace(/<p class="mb-6 text-gray-700 leading-relaxed">\s*<\/p>/g, '');
  
  // Final cleanup - remove any remaining image placeholders that weren't caught
  html = html.replace(/!\[(?:AI Generated Image|DALL-E):[^\]]*\]/g, '');
  
  // Final cleanup - remove any remaining markdown symbols
  html = html.replace(/^#{1,4}\s+/gm, ''); // Remove any remaining # symbols at start of lines
  html = html.replace(/#{1,4}\s+/g, ''); // Remove any # symbols anywhere
  
  // Add FAQ styling if present
  html = html.replace(
    /<h2[^>]*>(?:Frequently Asked Questions|FAQ)<\/h2>/i,
    '<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6 leading-tight">Frequently Asked Questions</h2>'
  );
  
  // Style FAQ questions as h3
  const faqSection = html.match(/<h2[^>]*>(?:Frequently Asked Questions|FAQ)<\/h2>([\s\S]*?)$/i);
  if (faqSection) {
    const faqContent = faqSection[1];
    const styledFaqContent = faqContent.replace(
      /<p class="mb-6 text-gray-700 leading-relaxed">(<strong>.*?<\/strong>.*?)<\/p>/g,
      (match, content) => {
        if (content.includes('?')) {
          return `<h3 class="text-lg font-bold text-gray-900 mt-6 mb-3">${content.replace(/<\/?strong>/g, '')}</h3>`;
        }
        return match;
      }
    );
    html = html.replace(faqSection[1], styledFaqContent);
  }
  
  return html;
}