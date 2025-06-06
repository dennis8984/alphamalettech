import { NextResponse } from 'next/server';

// Simple in-memory storage (will reset on server restart, but works for testing)
let popunderSettings = {
  enabled: false,
  lastUpdated: new Date().toISOString()
};

export async function GET() {
  try {
    console.log('📖 Getting popunder settings from memory:', popunderSettings);
    
    return NextResponse.json({ 
      enabled: popunderSettings.enabled,
      success: true,
      source: 'memory',
      lastUpdated: popunderSettings.lastUpdated
    });

  } catch (error) {
    console.error('❌ Simple popunder GET error:', error);
    return NextResponse.json({ 
      enabled: false,
      success: true,
      source: 'fallback'
    });
  }
}

export async function POST(request: Request) {
  try {
    const { enabled } = await request.json();

    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid enabled value' }, { status: 400 });
    }

    console.log('💾 Saving popunder settings to memory:', enabled);

    // Update in-memory settings
    popunderSettings = {
      enabled,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Popunder settings saved successfully:', popunderSettings);

    return NextResponse.json({ 
      enabled,
      success: true,
      source: 'memory',
      message: `Popunder ads ${enabled ? 'enabled' : 'disabled'} successfully`,
      lastUpdated: popunderSettings.lastUpdated
    });

  } catch (error) {
    console.error('❌ Simple popunder POST error:', error);
    return NextResponse.json({ 
      error: `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 