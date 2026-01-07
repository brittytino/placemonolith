'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[Login] Attempting login with:', email);

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      console.log('[Login] SignIn result:', result);

      if (result?.error) {
        console.error('[Login] Error:', result.error);
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      if (result?.ok) {
        console.log('[Login] Success! Redirecting...');
        // Force a hard redirect to ensure session is loaded
        window.location.href = '/admin-dashboard';
      }
    } catch (err) {
      console.error('[Login] Exception:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">SkillSphere</CardTitle>
          <CardDescription className="text-center">
            Smart Student Placement Intelligence Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@psgtech.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <p className="text-xs text-slate-500">Use your official PSG Tech email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Placement Representatives & Students only</p>
            <p className="text-xs mt-1">No registration - accounts are created by admins</p>
            <p className="text-xs mt-2 text-indigo-400">
              Test: superadmin@psgtech.ac.in / Superadmin@psgmx
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
