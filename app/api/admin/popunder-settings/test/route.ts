import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET() {
  try {
    console.log('🧪 Testing Supabase connection for popunder settings...');
    
    // Test basic Supabase connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('articles')
      .select('id')
      .limit(1);

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: connectionError.message,
        code: connectionError.code
      });
    }

    // Test if site_settings table exists
    const { data: tableTest, error: tableError } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1);

    return NextResponse.json({
      success: true,
      supabaseConnection: 'OK',
      articlesTable: connectionTest ? 'OK' : 'No data',
      siteSettingsTable: tableError ? `Error: ${tableError.message}` : 'OK',
      tableErrorCode: tableError?.code || null,
      message: 'Diagnostics complete'
    });

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 