'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@urban-wealth/core';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

function RegisterPageContent() {
  const { register: authRegister } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterInput) => {
    setIsSubmitting(true);
    setServerError('');
    try {
      await authRegister(data.fullName, data.email, data.password, data.confirmPassword);
      router.push(searchParams.get('redirect') ?? '/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requirements = [
    { met: password.length >= 8, label: '8+ chars' },
    { met: /[A-Z]/.test(password), label: 'Uppercase' },
    { met: /[0-9]/.test(password), label: 'Number' },
    { met: /[^a-zA-Z0-9]/.test(password), label: 'Symbol' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5 py-12 bg-muted-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[420px] rounded-2xl border border-border bg-card p-8 shadow-card"
      >
        <div className="mb-8 text-center">
          <h1 className="font-display text-[26px] font-bold text-foreground tracking-tight mb-2">
            Create an account
          </h1>
          <p className="text-[14px] text-muted">
            Start building your fractional real estate portfolio
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="rounded-md bg-destructive-400/10 border border-destructive-400/20 px-4 py-3 text-[13px] font-medium text-destructive-400">
              {serverError}
            </div>
          )}

          <Field label="Full Legal Name" error={errors.fullName?.message}>
            <input
              id="fullName"
              type="text"
              {...register('fullName')}
              className="input-field"
              placeholder="Jane Smith"
            />
          </Field>

          <Field label="Email Address" error={errors.email?.message}>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="input-field"
              placeholder="you@company.com"
            />
          </Field>

          <div>
            <Field label="Password" error={errors.password?.message}>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="input-field"
                placeholder="••••••••"
              />
            </Field>
            {/* Password requirements */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {requirements.map((req) => (
                <span
                  key={req.label}
                  className={`text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                    req.met ? 'text-positive-400' : 'text-muted'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${req.met ? 'bg-positive-400' : 'bg-border'}`} />
                  {req.label}
                </span>
              ))}
            </div>
          </div>

          <Field label="Confirm Password" error={errors.confirmPassword?.message}>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="input-field"
              placeholder="••••••••"
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary-500 px-4 py-3 text-[14px] font-bold text-white transition-all hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-md hover:shadow-lg"
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-[13px] font-medium text-muted border-t border-border pt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-500 hover:text-primary-400 transition-colors font-bold">
            Log in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-semibold text-muted uppercase tracking-wider">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-[12px] font-medium text-destructive-400">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted-bg" />}>
      <RegisterPageContent />
    </Suspense>
  );
}
