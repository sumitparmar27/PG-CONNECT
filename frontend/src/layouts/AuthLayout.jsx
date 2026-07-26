export function AuthLayout({ title, children }) {
  return (
    <section style={{ maxWidth: 360, margin: '80px auto', padding: 24 }}>
      <h1>{title}</h1>
      {children}
    </section>
  )
}
