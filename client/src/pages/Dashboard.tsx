import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { siteCtaClass } from '../lib/ui'

export function Dashboard() {
  const { user } = useAuth()

  return (
    <section style={{ maxWidth: 480 }}>
      <h1>Welcome, {user?.name}</h1>
      <p style={{ color: 'var(--text)' }}>{user?.email}</p>
      <Link to="/dashboard/properties" className={siteCtaClass} style={{ marginTop: 16 }}>
        Manage my properties
      </Link>
    </section>
  )
}
