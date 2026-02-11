'use client';

import React, { useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter the admin password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(`/${locale}/admin`);
        router.refresh();
      } else {
        setError(data.error || 'Authentication failed');
        setPassword('');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#D4AF37]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#D4AF37]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20">
            <Shield className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            MorocNights Admin
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter the admin password to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Admin Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  autoFocus
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 pr-12
                    text-sm text-white placeholder-gray-500
                    focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-500
                    hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-3
                text-sm font-semibold text-gray-950
                hover:bg-[#E5C349] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:ring-offset-2 focus:ring-offset-gray-900
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-150"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Protected admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
