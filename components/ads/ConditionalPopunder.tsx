'use client';

import { useEffect, useState } from 'react';

interface ConditionalPopunderProps {
  targetUrl: string;
  delay?: number;
  onlyOnce?: boolean;
}

export default function ConditionalPopunder({ 
  targetUrl, 
  delay = 5000,
  onlyOnce = true 
}: ConditionalPopunderProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSettings = async () => {
      try {
        const response = await fetch('/api/admin/popunder-settings/simple');
        if (response.ok) {
          const data = await response.json();
          setEnabled(data.enabled || false);
        } else {
          setEnabled(false);
        }
      } catch (error) {
        console.error('Failed to check popunder settings:', error);
        setEnabled(false);
      }
      setLoading(false);
    };

    checkSettings();
  }, []);

  useEffect(() => {
    if (!enabled || loading) {
      return;
    }

    // Check if popunder was already shown today (if onlyOnce is true)
    if (onlyOnce) {
      const lastShown = localStorage.getItem('popunder_last_shown');
      const today = new Date().toDateString();
      
      if (lastShown === today) {
        console.log('Popunder already shown today, skipping');
        return;
      }
    }

    const timer = setTimeout(() => {
      // Create popunder
      const popunder = window.open(
        targetUrl,
        '_blank',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (popunder) {
        // Focus back to main window (creates the "under" effect)
        window.focus();
        
        // Mark as shown today
        if (onlyOnce) {
          localStorage.setItem('popunder_last_shown', new Date().toDateString());
        }

        console.log('✅ Popunder ad displayed:', targetUrl);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, loading, targetUrl, delay, onlyOnce]);

  // This component doesn't render anything visible
  return null;
}

// Example usage:
// <ConditionalPopunder 
//   targetUrl="https://example.com/ad" 
//   delay={3000}
//   onlyOnce={true}
// /> 