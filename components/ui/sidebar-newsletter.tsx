'use client';

import { useState } from 'react';

const SidebarNewsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In a real app, this would send the email to a backend service
      setSubscribed(true);
      setEmail('');
    }
  };

  if (subscribed) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 py-3 px-4 rounded-md text-center">
        <p className="font-medium text-sm">Thanks for subscribing!</p>
        <p className="text-xs mt-1">Check your inbox soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
        required
      />
      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
      >
        Subscribe
      </button>
      <p className="text-xs text-gray-500 text-center leading-tight">
        By subscribing, you agree to our Privacy Policy.
      </p>
    </form>
  );
};

export default SidebarNewsletter; 