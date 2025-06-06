import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection and get a few articles
    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, title, slug, category, status')
      .limit(5);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ 
        error: 'Supabase connection failed', 
        details: error 
      }, { status: 500 });
    }

    console.log('Found articles:', articles);

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      articleCount: articles?.length || 0,
      sampleArticles: articles
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
} 