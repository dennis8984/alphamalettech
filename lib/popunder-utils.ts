// Utility function to check if popunder ads are enabled
export async function isPopunderEnabled(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/popunder-settings');
    if (response.ok) {
      const data = await response.json();
      return data.enabled || false;
    }
    return false;
  } catch (error) {
    console.error('Failed to check popunder settings:', error);
    return false;
  }
}

// Example usage for popunder ads
export function shouldShowPopunder(): Promise<boolean> {
  return isPopunderEnabled();
}

// Simple function to check if popunder should show (for use in components)
export async function checkPopunderStatus(): Promise<{ enabled: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/popunder-settings');
    if (response.ok) {
      const data = await response.json();
      return { enabled: data.enabled || false };
    }
    return { enabled: false, error: 'Failed to fetch settings' };
  } catch (error) {
    return { enabled: false, error: 'Network error' };
  }
} 