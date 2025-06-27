'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { validate } from '../lib/api';
import Loading from './components/Loading';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      function getCookie(name: string) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
      }
      const token = getCookie('access_token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      const response = await validate(token);
      if (response.valid) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="16" fill="#222" />
            <path d="M16 8L22 24H10L16 8Z" fill="#fff" />
          </svg>
          <span className="font-bold text-xl text-black tracking-tight">
            Zenith-AI
          </span>
        </div>
        <nav className="flex gap-4">
          {isAuthenticated ? (
            <Link
              href="/workspace"
              className="text-black hover:underline font-medium"
            >
              Chat Workspace
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-black hover:underline font-medium"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="text-black hover:underline font-medium"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center text-center px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4">
          Summarize Smarter, Read Faster
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8">
          Leveraging advanced AI, Zenith-AI condenses lengthy documents into
          digestible summaries, saving you time and enhancing comprehension.
        </p>
        <div className="flex gap-4 justify-center mb-10">
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-black text-white rounded-lg font-semibold shadow hover:bg-gray-900 transition"
          >
            Get Started
          </Link>
          {!isAuthenticated && (
            <Link
              href="/auth/login"
              className="px-6 py-3 border border-black text-black rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Login
            </Link>
          )}
        </div>
        {/* Feature Highlights */}
        <div className="flex flex-col md:flex-row gap-6 mt-8 max-w-3xl w-full justify-center">
          <div className="flex-1 flex flex-col items-center">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#222" opacity="0.08" />
              <path
                d="M8 12h8M8 16h5"
                stroke="#222"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="mt-2 font-medium text-black">Save Time</span>
            <span className="text-gray-700 text-sm">
              Instantly distill long texts into concise summaries.
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#222" opacity="0.08" />
              <path
                d="M12 8v8M8 12h8"
                stroke="#222"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="mt-2 font-medium text-black">
              Boost Comprehension
            </span>
            <span className="text-gray-700 text-sm">
              Understand key points at a glance.
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#222" opacity="0.08" />
              <path
                d="M7 17l5-5 5 5"
                stroke="#222"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="mt-2 font-medium text-black">
              Effortless Organization
            </span>
            <span className="text-gray-700 text-sm">
              Keep your summaries organized and accessible.
            </span>
          </div>
        </div>
      </section>

      {/* Footer (optional) */}
      <footer className="text-center text-gray-500 py-6 text-sm opacity-80">
        &copy; {new Date().getFullYear()} Zenith-AI. All rights reserved.
      </footer>
    </main>
  );
}
