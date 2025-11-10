import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Correct Supabase client initialization (uses environment variables)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Spinner = () => (
  <div className="flex items-center justify-center space-x-2">
    <svg
      className="animate-spin h-5 w-5 text-white dark:text-gray-300"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2
        5.291A7.962 7.962 0 014 12H0c0 3.042
        1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span className="text-white dark:text-gray-300">Logging in...</span>
  </div>
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Direct call to the actual Supabase client
      const { error } = await supabase.auth.signInWithPassword({ email, password });
     
      if (error) throw error;
     
      // On successful login, redirect to admin page
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto mt-20 overflow-hidden transition-colors duration-300">
      {/* Animated gradient background is now blue-only */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
     
      <div className="relative bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        {/* Top accent bar is solid blue-600 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
       
        {/* Icon background is solid blue-100 */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
            <span className="text-4xl">🔐</span>
          </div>
        </div>
       
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">Admin Login</h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Access your management portal</p>
       
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email field */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="admin@hsv.co.ug"
              required
              disabled={isLoading}
              className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {focusedField === 'email' && (
              <div className="absolute inset-0 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 pointer-events-none"></div>
            )}
          </div>
         
          {/* Password field */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-900 dark:text-white"
            />
            {focusedField === 'password' && (
              <div className="absolute inset-0 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 pointer-events-none"></div>
            )}
          </div>
         
          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full py-4 font-bold rounded-xl text-white transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden ${
              isLoading
                ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
                : 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 dark:text-white'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoading ? <Spinner /> : (
                <>
                  Login to Dashboard
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </span>
            {!isLoading && (
              <>
                {/* Hover overlay is solid dark blue-900 */}
                <div className="absolute inset-0 bg-blue-900 dark:bg-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </>
            )}
          </button>
        </form>
       
        {/* Error message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-r-xl animate-fade-in">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="text-red-700 dark:text-red-300 font-semibold text-sm">{error}</p>
            </div>
          </div>
        )}
       
        {/* Help text */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Need help? Contact{' '}
          <a
            href="mailto:support@hsv.co.ug"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
          >
            support@hsv.co.ug
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;