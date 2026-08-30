import type { ReactNode } from 'react'
import { CheckIcon } from '../components/icons'
import './AuthLayout.css'

const FEATURES = [
  'Verified PGs near your college or office',
  'Transparent pricing, zero brokerage',
  'Book a visit in under two minutes',
]

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-brand__blob auth-brand__blob--one" />
        <div className="auth-brand__blob auth-brand__blob--two" />
        <div className="auth-brand__content">
          <span className="auth-brand__logo">
            <span className="auth-brand__logo-mark">PG</span>
            Connect
          </span>
          <h2 className="auth-brand__heading">Your next stay, sorted.</h2>
          <p className="auth-brand__text">
            Discover verified paying-guest accommodations, compare amenities and book with
            confidence — all in one place.
          </p>
          <ul className="auth-brand__features">
            {FEATURES.map((feature) => (
              <li key={feature}>
                <CheckIcon />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <main className="auth-form-panel">
        <div className="auth-card">
          <span className="auth-card__logo auth-card__logo--mobile">
            <span className="auth-brand__logo-mark">PG</span>
            Connect
          </span>
          <h1 className="auth-card__title">{title}</h1>
          <p className="auth-card__subtitle">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  )
}
