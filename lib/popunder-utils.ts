import React, { useState, useEffect } from 'react';

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

// Client-side hook for React components
export function usePopunderEnabled() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEnabled = async () => {
      const isEnabled = await isPopunderEnabled();
      setEnabled(isEnabled);
      setLoading(false);
    };

    checkEnabled();
  }, []);

  return { enabled, loading };
}

// Example usage for popunder ads
export function shouldShowPopunder(): Promise<boolean> {
  return isPopunderEnabled();
}

// Helper to create a conditional popunder component
export function withPopunderCheck<T>(
  PopunderComponent: React.ComponentType<T>,
  fallback?: React.ComponentType
) {
  return function ConditionalPopunder(props: T) {
    const { enabled, loading } = usePopunderEnabled();

    if (loading) {
      return null; // or a loading component
    }

    if (!enabled) {
      return fallback ? React.createElement(fallback) : null;
    }

    return React.createElement(PopunderComponent, props);
  };
} 