'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { login, getGoogleAuthLoginUrl } from '../../../lib/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await login({
        username: formData.email,
        password: formData.password,
      });

      if (response.access_token) {
        // Store the access token in a cookie (expires in 7 days)
        document.cookie = `access_token=${
          response.access_token
        }; path=/; max-age=${60 * 60 * 24 * 7}`;
        // Redirect to dashboard or home
        router.push('/workspace');
      } else {
        setErrors({ general: response.detail || 'Login failed' });
      }
    } catch {
      setErrors({ general: 'An error occurred during login' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
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
          </Link>
          <h1 className="text-2xl font-bold text-black">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Sign in to your Zenith-AI account
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-lg p-6"
        >
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 mt-9">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              {/* Google Auth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition mb-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="20"
                  height="20"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="text-black hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
