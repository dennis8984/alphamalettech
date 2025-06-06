import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET() {
  try {
    console.log('📖 Fetching popunder settings...');
    
    // Try to get the setting from Supabase
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'popunder_enabled')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116 = "not found"
      console.error('❌ Supabase error:', error);
      // Return default if there's an error
      return NextResponse.json({ 
        enabled: false,
        success: true 
      });
    }

    const enabled = data?.value === 'true' || false;
    console.log('✅ Popunder settings loaded:', enabled);

    return NextResponse.json({ 
      enabled,
      success: true 
    });

  } catch (error) {
    console.error('❌ Popunder settings GET error:', error);
    // Return default if anything fails
    return NextResponse.json({ 
      enabled: false,
      success: true 
    });
  }
}

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid enabled value' }, { status: 400 });
    }

    console.log('💾 Saving popunder settings:', enabled);

    // First, try to create the site_settings table if it doesn't exist
    // This is a simple approach - you may want to create the table manually in Supabase
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Execute raw SQL to create table (will be ignored if table exists)
    try {
      await supabase.rpc('exec_sql', { sql: createTableQuery });
    } catch (tableError) {
      console.log('Table creation skipped (may already exist):', tableError);
    }

    // Upsert the popunder setting
    const { error } = await supabase
      .from('site_settings')
      .upsert(
        {
          key: 'popunder_enabled',
          value: enabled.toString(),
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'key'
        }
      );

    if (error) {
      console.error('❌ Error saving popunder settings:', error);
      return NextResponse.json({ 
        error: `Failed to save settings: ${error.message}` 
      }, { status: 500 });
    }

    console.log('✅ Popunder settings saved successfully:', enabled);

    return NextResponse.json({ 
      enabled,
      success: true,
      message: `Popunder ads ${enabled ? 'enabled' : 'disabled'} successfully`
    });

  } catch (error) {
    console.error('❌ Popunder settings POST error:', error);
    return NextResponse.json({ 
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 