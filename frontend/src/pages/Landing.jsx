import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>🤝 Chama Management System</h1>
        <p style={styles.subtitle}>
          Manage your chama contributions, loans and members digitally.
          Pay via M-Pesa instantly.
        </p>
        <div style={styles.buttons}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate('/register')}
          >
            Get Started
          </button>
          <button
            style={styles.secondaryBtn}
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </div>

      <div style={styles.features}>
        <div style={styles.featureCard}>
          <h3>📱 M-Pesa Payments</h3>
          <p>Contribute to your chama instantly via M-Pesa STK Push</p>
        </div>
        <div style={styles.featureCard}>
          <h3>💰 Loan Management</h3>
          <p>Apply for loans and get approved by your chama admin</p>
        </div>
        <div style={styles.featureCard}>
          <h3>📊 Live Dashboard</h3>
          <p>Track contributions, loans and chama balance in real time</p>
        </div>
        <div style={styles.featureCard}>
          <h3>👥 Member Management</h3>
          <p>Manage chama members and track individual contributions</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#1a1a2e',
  },
  hero: {
    textAlign: 'center',
    padding: '80px 24px',
  },
  title: {
    fontSize: '42px',
    color: '#4CAF50',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#ccc',
    maxWidth: '600px',
    margin: '0 auto 40px',
    lineHeight: '1.6',
  },
  buttons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  primaryBtn: {
    padding: '14px 40px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '14px 40px',
    backgroundColor: 'transparent',
    color: 'white',
    border: '2px solid white',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    padding: '0 40px 80px',
  },
  featureCard: {
    backgroundColor: '#16213e',
    padding: '24px',
    borderRadius: '12px',
    color: 'white',
    textAlign: 'center',
    lineHeight: '1.6',
  },
}

export default Landing