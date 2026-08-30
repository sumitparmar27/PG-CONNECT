import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AuthLayout } from '../layouts/AuthLayout'
import { useAuth } from '../hooks/useAuth'
import { AlertIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, SpinnerIcon } from '../components/icons'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.message : undefined
      setError(message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue browsing PGs.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <div className="input-wrap">
            <MailIcon />
            <input
              id="login-email"
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
          <label htmlFor="login-password">Password</label>
          <div className="input-wrap">
            <LockIcon />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
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
          {submitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="auth-card__footer">
        No account? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  )
}
