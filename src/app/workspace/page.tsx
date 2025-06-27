'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatWorkspace from '../ChatWorkspace';
import { validate, getCurrentUser } from '../../lib/api';
import Loading from '../components/Loading';

export default function WorkspacePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const router = useRouter();

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
        router.replace('/auth/login');
        return;
      }
      const response = await validate(token);
      if (response.valid) {
        const user = await getCurrentUser(token);
        console.log(user);
        setUserName(user?.name || 'User');
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace('/auth/login');
      }
    }
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAuthenticated === null) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null; // Redirecting
  }

  return <ChatWorkspace userName={userName} />;
}
