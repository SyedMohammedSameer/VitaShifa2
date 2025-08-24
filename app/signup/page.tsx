"use client";

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import i18n from '@/lib/i18n';

export default function SignUp() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize i18n if not already done
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError(t('auth.errors.passwordTooShort'));
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      console.error('Sign up error:', err);
      // Translate common Firebase auth errors
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError(t('auth.errors.emailInUse'));
          break;
        case 'auth/invalid-email':
          setError(t('auth.errors.invalidEmail'));
          break;
        case 'auth/weak-password':
          setError(t('auth.errors.weakPassword'));
          break;
        case 'auth/too-many-requests':
          setError(t('auth.errors.tooManyRequests'));
          break;
        default:
          setError(t('auth.errors.signUpFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <Card className="w-full max-w-md glass-card border-border/50">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('dashboard.title')}
            </h1>
          </div>
          <CardTitle className="text-xl">{t('auth.signUp')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('auth.signUpSubtitle')}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                disabled={loading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                disabled={loading}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">{t('auth.passwordRequirement')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                required
                disabled={loading}
                className="h-11"
              />
            </div>
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.signUp')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link href="/signin" className="text-primary hover:text-primary/80 font-medium underline underline-offset-4">
                {t('auth.signIn')}
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground text-center">
              {t('auth.termsNotice')}{' '}
              <Link href="/terms" className="text-primary hover:text-primary/80 underline">
                {t('auth.termsOfService')}
              </Link>{' '}
              {t('common.and')}{' '}
              <Link href="/privacy" className="text-primary hover:text-primary/80 underline">
                {t('auth.privacyPolicy')}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}