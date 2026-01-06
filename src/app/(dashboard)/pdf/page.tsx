'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import PacmanLoader from 'react-spinners/PacmanLoader';
import PdfChat from '@/components/PdfChat';

export default function ScribaChatPage() {
  const { status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <PacmanLoader color="#538B81" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-muted-foreground mb-6">Please sign in to access Scriba.</p>
        <Button onClick={() => router.push('/api/auth/signin')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <PdfChat />
    </div>
  );
}