'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isAuthReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = ['/login', '/forgot-password', '/reset-password'].includes(pathname);
  const isEmployeePage = pathname === '/employee' || pathname.startsWith('/employee/');

  useEffect(() => {
    if (!mounted || !isAuthReady) return;

    if (!isLoggedIn && !isAuthPage) {
      router.replace('/login');
      return;
    }

    if (isLoggedIn && isAuthPage) {
      router.replace(user.role === 'EMPLOYEE' ? '/employee' : '/');
      return;
    }

    if (isLoggedIn && user.role === 'EMPLOYEE' && !isEmployeePage) {
      router.replace('/employee');
      return;
    }

    if (isLoggedIn && user.role !== 'EMPLOYEE' && isEmployeePage) {
      router.replace('/');
    }
  }, [mounted, isAuthReady, isLoggedIn, user.role, isAuthPage, isEmployeePage, router]);

  if (!mounted || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: '#111111', color: '#85827C' }}>
        Loading TrustLine…
      </div>
    );
  }

  if (!isLoggedIn && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: '#111111', color: '#85827C' }}>
        Redirecting to sign in…
      </div>
    );
  }

  if (
    isLoggedIn &&
    ((user.role === 'EMPLOYEE' && !isEmployeePage && !isAuthPage) ||
      (user.role !== 'EMPLOYEE' && isEmployeePage))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: '#111111', color: '#85827C' }}>
        Opening your TrustLine workspace…
      </div>
    );
  }

  return (
    <>
      {!isAuthPage && !isEmployeePage && <Navbar />}
      {isAuthPage ? children : (
        <main className="app-container flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
          {children}
        </main>
      )}
    </>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
