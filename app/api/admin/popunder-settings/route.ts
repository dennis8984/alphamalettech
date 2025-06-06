import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

const SETTINGS_FILE = join(process.cwd(), 'data', 'popunder-settings.json');

// Ensure data directory exists and create default settings
async function ensureSettingsFile() {
  try {
    await readFile(SETTINGS_FILE, 'utf8');
  } catch (error) {
    // File doesn't exist, create it with default settings
    const defaultSettings = { enabled: false };
    try {
      await writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    } catch (writeError) {
      console.error('Failed to create settings file:', writeError);
    }
  }
}

export async function GET() {
  try {
    await ensureSettingsFile();
    
    const data = await readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);

    return NextResponse.json({ 
      enabled: settings.enabled || false,
      success: true 
    });

  } catch (error) {
    console.error('Popunder settings GET error:', error);
    // Return default if file read fails
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

    await ensureSettingsFile();
    
    const settings = {
      enabled,
      updatedAt: new Date().toISOString()
    };

    await writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));

    console.log('✅ Popunder settings saved to file:', enabled);

    return NextResponse.json({ 
      enabled,
      success: true,
      message: `Popunder ads ${enabled ? 'enabled' : 'disabled'} successfully`
    });

  } catch (error) {
    console.error('Popunder settings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 