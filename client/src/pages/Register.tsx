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
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="register-name">Full name</label>
          <div className="input-wrap">
            <UserIcon />
            <input
              id="register-name"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="register-email">Email</label>
          <div className="input-wrap">
            <MailIcon />
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="register-password">Password</label>
          <div className="input-wrap">
            <LockIcon />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="input-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {error && (
          <p className="auth-alert" role="alert">
            <AlertIcon />
            {error}
          </p>
        )}

        <button className="auth-submit" type="submit" disabled={submitting}>
          {submitting && <SpinnerIcon />}
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="auth-card__footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}
