'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { googleAuthCallback } from '../../../../lib/api';

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleGoogleCallback() {
      // Get the code from the query params
      const code = searchParams.get('code');
      if (!code) {
        // handle error, e.g., redirect to login or show error
        router.replace('/auth/login?message=Google+login+failed');
        return;
      }
      try {
        // Send code in POST body to backend
        const data = await googleAuthCallback(code);

        if (data.access_token && data.user) {
          document.cookie = `access_token=${
            data.access_token
          }; path=/; max-age=${60 * 30}`; // 30 minutes
          // Optionally store user info in localStorage for later use
          localStorage.setItem('user', JSON.stringify(data.user));
          router.push('/workspace');
        } else {
          // handle error, e.g., redirect to login with error message
          router.replace('/auth/login?message=Google+login+failed');
        }
      } catch {
        // handle error, e.g., redirect to login with error message
        router.replace('/auth/login?message=Google+login+failed');
      }
    }
    handleGoogleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Signing you in...</p>
    </div>
  );
}
