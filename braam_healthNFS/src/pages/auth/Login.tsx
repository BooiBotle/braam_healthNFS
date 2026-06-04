// src/pages/auth/Login.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function Login() {
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    const { error } = await supabase.auth.signInWithPassword(data)
    if (error) setError(error.message)
    else navigate('/')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 flex-col justify-between p-10"
        style={{ backgroundColor: '#0d1b2e' }}>
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#1e2d3d' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1" fill="#c9a84c"/>
                <rect x="14" y="3" width="7" height="7" rx="1" fill="#c9a84c"/>
                <rect x="3" y="14" width="7" height="7" rx="1" fill="#c9a84c"/>
                <rect x="14" y="14" width="7" height="7" rx="1" fill="#c9a84c"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white font-bold text-lg tracking-wide">NFS</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded border"
                  style={{ color: '#c9a84c', borderColor: '#c9a84c' }}>INSURE</span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#6b8caa' }}>Braam Health Centre</p>
            </div>
          </div>

          <h2 className="text-white text-3xl font-bold leading-snug mb-4">
            Your health,<br />managed simply.
          </h2>
          <p style={{ color: '#6b8caa' }} className="text-sm leading-relaxed">
            Access your membership card, consultations, appointments, and debit orders — all in one place.
          </p>
        </div>

        <p style={{ color: '#3d5166' }} className="text-xs">
          © 2026 Braam Health Centre · NFS Insure FSP 53910
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ backgroundColor: '#f4f5f7' }}>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <span className="font-bold text-lg" style={{ color: '#0d1b2e' }}>NFS</span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded border"
              style={{ color: '#c9a84c', borderColor: '#c9a84c' }}>INSURE</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0d1b2e' }}>Welcome back</h1>
          <p className="text-sm mb-7" style={{ color: '#6b7280' }}>Sign in to your member portal</p>

          {error && (
            <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm mb-5 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#10b981' } as React.CSSProperties}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" style={{ color: '#374151' }}>Password</label>
                <a href="#" className="text-xs hover:underline" style={{ color: '#10b981' }}>Forgot password?</a>
              </div>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white font-medium py-2.5 rounded-lg text-sm transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#10b981' }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium hover:underline" style={{ color: '#10b981' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}