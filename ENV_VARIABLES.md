# Environment Variables Setup

This project uses OpenAI GPT-4 for article rewriting and enhancement. You need to set up the following environment variables:

## Required Environment Variables

### OpenAI API Configuration
```bash
# OpenAI API Key for GPT-4 article rewriting
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
5. Make sure you have GPT-4 access enabled on your account

### Perplexity API Key (Optional)
1. Visit https://www.perplexity.ai/
2. Sign up for an API account
3. Generate your API key from the dashboard

## AI Model Configuration

The project is configured to use:
- **Model**: GPT-4
- **Temperature**: 0.7 (for creative yet coherent content)
- **Max Tokens**: 6000 per article section

## Usage

Once configured, the Men's Health import feature will automatically use OpenAI GPT-4 for:
- Complete article rewriting for originality
- SEO optimization with keyword placement
- Engaging headline generation
- Detailed image prompt generation
- Structured content with proper formatting
- FAQ section generation

## Cost Considerations

OpenAI GPT-4 usage is billed per token. Each article rewrite typically uses:
- Input: ~2,000-4,000 tokens (original article)
- Output: ~4,000-6,000 tokens (rewritten article)
- Estimated cost: $0.30-0.60 per article

Monitor your OpenAI usage at: https://platform.openai.com/usage