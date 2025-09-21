export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{ fontSize: '4rem', margin: '0', color: '#1a202c' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', margin: '1rem 0', color: '#4a5568' }}>Page Not Found</h2>
      <p style={{ color: '#718096', marginBottom: '2rem' }}>
        The page you are looking for doesn't exist.
      </p>
      <a
        href="/"
        style={{
          background: '#000000',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600'
        }}
      >
        Go Home
      </a>
    </div>
  );
}