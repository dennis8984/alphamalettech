import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ImportArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image: string
  category: string
  author: string
  date: string
  featured: boolean
  trending: boolean
}

export async function POST(request: NextRequest) {
  try {
    const { articles }: { articles: ImportArticle[] } = await request.json()

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return NextResponse.json({ error: 'No articles provided' }, { status: 400 })
    }

    if (articles.length > 1000) {
      return NextResponse.json({ error: 'Cannot import more than 1000 articles at once' }, { status: 400 })
    }

    // Process articles in batches of 100 for better performance
    const batchSize = 100
    const results = {
      imported: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize)
      
      try {
        // Transform articles for Supabase
        const supabaseArticles = batch.map(article => ({
          title: article.title,
          slug: ensureUniqueSlug(article.slug),
          excerpt: article.excerpt,
          content: article.content,
          image_url: article.image,
          category: article.category,
          author: article.author,
          published_at: article.date,
          featured: article.featured,
          trending: article.trending,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        const { data, error } = await supabase
          .from('articles')
          .insert(supabaseArticles)
          .select('id, title')

        if (error) {
          throw error
        }

        results.imported += batch.length
        
        // Update progress
        const progress = Math.round((results.imported / articles.length) * 100)
        console.log(`Import progress: ${progress}% (${results.imported}/${articles.length})`)

      } catch (batchError) {
        console.error(`Batch import error:`, batchError)
        results.failed += batch.length
        results.errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${batchError}`)
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        total: articles.length,
        imported: results.imported,
        failed: results.failed,
        errors: results.errors
      }
    })

  } catch (error) {
    console.error('Import process error:', error)
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    )
  }
}

async function ensureUniqueSlug(slug: string): Promise<string> {
  let uniqueSlug = slug
  let counter = 1

  while (true) {
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', uniqueSlug)
      .single()

    if (error && error.code === 'PGRST116') {
      // No article found with this slug, it's unique
      break
    }

    if (error) {
      // Some other error, break and use the slug as is
      break
    }

    // Slug exists, try with counter
    uniqueSlug = `${slug}-${counter}`
    counter++
  }

  return uniqueSlug
} 