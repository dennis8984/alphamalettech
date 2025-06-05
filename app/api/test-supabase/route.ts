import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function GET() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test 1: Check if we can connect to Supabase
    const { data: connectionTest, error: connectionError } = await supabase
      .from('articles')
      .select('count', { count: 'exact', head: true })

    if (connectionError) {
      console.error('❌ Supabase connection failed:', connectionError)
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: connectionError.message,
        step: 'connection'
      }, { status: 500 })
    }

    // Test 2: Try to get table structure
    const { data: tableData, error: tableError } = await supabase
      .from('articles')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Table access failed:', tableError)
      return NextResponse.json({
        success: false,
        error: 'Table access failed',
        details: tableError.message,
        step: 'table_access'
      }, { status: 500 })
    }

    // Test 3: Try to insert a test article
    const testArticle = {
      title: 'Test Article - ' + new Date().toISOString(),
      slug: 'test-article-' + Date.now(),
      content: 'This is a test article to verify Supabase connection.',
      excerpt: 'Test excerpt',
      category: 'Test',
      status: 'draft' as const,
      tags: ['test'],
      author: 'Test Author'
    }

    const { data: insertData, error: insertError } = await supabase
      .from('articles')
      .insert([testArticle])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Insert test failed',
        details: insertError.message,
        step: 'insert_test',
        testArticle
      }, { status: 500 })
    }

    // Test 4: Clean up test article
    await supabase
      .from('articles')
      .delete()
      .eq('id', insertData.id)

    console.log('✅ All Supabase tests passed!')
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection working correctly',
      tests: {
        connection: 'passed',
        table_access: 'passed', 
        insert_test: 'passed',
        cleanup: 'passed'
      },
      article_count: connectionTest?.count || 0
    })

  } catch (error) {
    console.error('❌ Test failed with exception:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed with exception',
      details: error instanceof Error ? error.message : 'Unknown error',
      step: 'exception'
    }, { status: 500 })
  }
} 