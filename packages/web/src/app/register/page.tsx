'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@urban-wealth/core';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import Link from 'next/link';

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
    { met: password.length >= 8, label: '8+ characters' },
    { met: /[A-Z]/.test(password), label: 'Uppercase' },
    { met: /[0-9]/.test(password), label: 'Number' },
    { met: /[^a-zA-Z0-9]/.test(password), label: 'Symbol' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-[380px] animate-fade-in">
        <div className="mb-6">
          <h1 className="font-display text-[22px] font-bold text-white tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-[13px] text-surface-400">
            Start investing in fractional real estate
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-md bg-destructive-400/[0.08] border border-destructive-400/[0.15] px-3 py-2.5 text-[13px] text-destructive-400">
              {serverError}
            </div>
          )}

          <Field label="Full name" error={errors.fullName?.message}>
            <input
              id="fullName"
              type="text"
              {...register('fullName')}
              className="input-field"
              placeholder="Jane Smith"
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
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
            {/* Password requirements — minimal inline checks */}
            <div className="mt-2 flex gap-3">
              {requirements.map((req) => (
                <span
                  key={req.label}
                  className={`text-[11px] transition-colors ${
                    req.met ? 'text-positive-400' : 'text-surface-600'
                  }`}
                >
                  {req.met ? '✓' : '·'} {req.label}
                </span>
              ))}
            </div>
          </div>

          <Field label="Confirm password" error={errors.confirmPassword?.message}>
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
            className="w-full rounded-md bg-primary-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-surface-500">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-surface-400">{label}</label>
      {children}
      {error && <p className="mt-1 text-[11px] text-destructive-400">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}
