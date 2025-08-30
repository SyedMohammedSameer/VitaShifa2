"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/context/AuthContext";
import { useEffect, Suspense } from "react"; // Import Suspense
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground animate-pulse">
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4.5 12.75l6 6 9-13.5"/>
            </svg>
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('dashboard.title')}
            </h2>
            <p className="text-muted-foreground animate-pulse">
              {t('common.loading')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout />
    </Suspense>
  );
}