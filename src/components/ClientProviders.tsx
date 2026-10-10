'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

function AuthGuard({
  children,
  typographyClassName,
}: {
  children: React.ReactNode;
  typographyClassName: string;
}) {
  const { user, isLoggedIn, isAuthReady } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = ['/login', '/forgot-password', '/reset-password'].includes(pathname);
  const isEmployeePage = pathname === '/employee' || pathname.startsWith('/employee/');
  const isPublicPage = pathname === '/';

  useEffect(() => {
    if (!mounted || !isAuthReady) return;

    if (!isLoggedIn && !isAuthPage && !isPublicPage) {
      router.replace('/login');
      return;
    }

    if (isLoggedIn && isAuthPage) {
      router.replace(user.role === 'EMPLOYEE' ? '/employee' : '/dashboard');
      return;
    }

    if (isLoggedIn && user.role === 'EMPLOYEE' && !isEmployeePage) {
      router.replace('/employee');
      return;
    }

    if (isLoggedIn && user.role !== 'EMPLOYEE' && isEmployeePage) {
      router.replace('/dashboard');
    }
  }, [mounted, isAuthReady, isLoggedIn, user.role, isAuthPage, isEmployeePage, isPublicPage, router]);

  if (!mounted || !isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: '#203234', color: '#B7C6C0' }}>
        Loading TrustLine…
      </div>
    );
  }

  if (!isLoggedIn && !isAuthPage && !isPublicPage) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: '#203234', color: '#B7C6C0' }}>
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
      <div className="min-h-screen flex items-center justify-center text-sm" style={{ background: '#203234', color: '#B7C6C0' }}>
        Opening your TrustLine workspace…
      </div>
    );
  }

  if (isAuthPage || isPublicPage) return <>{children}</>;

  return (
    <div className={`investigator-portal ${typographyClassName} flex min-w-0 flex-1 flex-col`}>
      {!isAuthPage && !isEmployeePage && !isPublicPage && <Navbar />}
      <main className="app-container flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto space-y-6">
        {children}
      </main>
    </div>
  );
}

export default function ClientProviders({
  children,
  typographyClassName,
}: {
  children: React.ReactNode;
  typographyClassName: string;
}) {
  return (
    <AuthProvider>
      <AuthGuard typographyClassName={typographyClassName}>{children}</AuthGuard>
    </AuthProvider>
  );
}
