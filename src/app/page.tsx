import { Suspense } from 'react';
import AuthCheck from './AuthCheck';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCheck />
    </Suspense>
  );
}
