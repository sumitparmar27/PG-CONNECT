import { useAuth } from '../hooks/useAuth'

export function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <section style={{ maxWidth: 480, margin: '80px auto', padding: 24 }}>
      <h1>Welcome, {user?.name}</h1>
      <p>{user?.email}</p>
      <button type="button" onClick={logout}>
        Log out
      </button>
    </section>
  )
}
