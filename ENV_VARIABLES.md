# Environment Variables Setup

This project uses OpenAI GPT-4o-mini for article rewriting and DALL-E 3 for image generation. You need to set up the following environment variables:

## Required Environment Variables

### OpenAI API Configuration
```bash
# OpenAI API Key for GPT-4o-mini article rewriting and DALL-E 3 image generation
OPENAI_API_KEY=your_openai_api_key_here
```

### Optional API Keys
```bash
# Perplexity API for fact-checking (optional)
PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Claude API for alternative AI enhancement (optional)
CLAUDE_API_KEY=your_claude_api_key_here
```

## Setting Up Locally

1. Create a `.env.local` file in the root directory
2. Add your API keys:
```bash
OPENAI_API_KEY=sk-...your_key_here...
```

## Setting Up on Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `PERPLEXITY_API_KEY` - Your Perplexity API key (optional)
   
4. Select all environments (Production, Preview, Development)
5. Save and redeploy

## Getting API Keys

### OpenAI API Key
1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Make sure you have access to GPT-4o-mini model and DALL-E 3

### Perplexity API Key (Optional)
1. Visit https://www.perplexity.ai/
2. Sign up for an API account
3. Generate your API key from the dashboard

## AI Model Configuration

The project is configured to use:
- **Text Model**: gpt-4o-mini (for article rewriting)
- **Image Model**: DALL-E 3 (for image generation)
- **Temperature**: 0.7 (for creative yet coherent content)
- **Max Tokens**: 6000 per article
- **Image Size**: 1792x1024 (16:9 aspect ratio)
- **Images per Article**: Up to 5

## Usage

Once configured, the Men's Health import feature will automatically use:

### OpenAI GPT-4o-mini for:
- Complete article rewriting for originality
- SEO optimization with keyword placement
- Engaging headline generation
- Structured content with proper formatting
- FAQ section generation

### DALL-E 3 for:
- Photorealistic fitness imagery
- Professional health and nutrition photos
- Custom images based on article content
- High-quality 16:9 images for web display

## Cost Considerations

OpenAI usage is billed as follows:

### GPT-4o-mini Text Generation:
- Input: ~2,000-4,000 tokens (original article)
- Output: ~4,000-6,000 tokens (rewritten article)
- Estimated cost: $0.05-0.10 per article

### DALL-E 3 Image Generation:
- Standard quality 1792x1024: ~$0.08 per image
- Up to 5 images per article: ~$0.40 per article
- Total estimated cost: $0.45-0.50 per article with images

Monitor your OpenAI usage at: https://platform.openai.com/usage