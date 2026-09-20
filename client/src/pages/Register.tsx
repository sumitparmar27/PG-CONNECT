import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AuthLayout } from '../layouts/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import {
  AlertIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  SpinnerIcon,
  UserIcon,
} from '../components/icons'
import { cn } from '../lib/utils'
import {
  authAlertClass,
  authFieldClass,
  authFieldLabelClass,
  authInputClass,
  authInputIconClass,
  authInputToggleClass,
  authInputWrapClass,
  authSubmitClass,
} from '../lib/ui'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register(form)
      navigate('/dashboard')
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(message || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Sign up to start finding your PG.">
      <form className="flex flex-col gap-[18px]" onSubmit={handleSubmit}>
        <div className={authFieldClass}>
          <label htmlFor="register-name" className={authFieldLabelClass}>
            Full name
          </label>
          <div className={authInputWrapClass}>
            <UserIcon className={authInputIconClass} />
            <input
              id="register-name"
              className={authInputClass}
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className={authFieldClass}>
          <label htmlFor="register-email" className={authFieldLabelClass}>
            Email
          </label>
          <div className={authInputWrapClass}>
            <MailIcon className={authInputIconClass} />
            <input
              id="register-email"
              className={authInputClass}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className={authFieldClass}>
          <label htmlFor="register-password" className={authFieldLabelClass}>
            Password
          </label>
          <div className={authInputWrapClass}>
            <LockIcon className={authInputIconClass} />
            <input
              id="register-password"
              className={cn(authInputClass, 'pr-[42px]')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className={authInputToggleClass}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && (
          <p className={authAlertClass} role="alert">
            <AlertIcon />
            {error}
          </p>
        )}

        <button className={authSubmitClass} type="submit" disabled={submitting}>
          {submitting && <SpinnerIcon />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-text">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent no-underline hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
