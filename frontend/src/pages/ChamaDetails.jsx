import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

const API = 'http://localhost:5000/api'

function ChamaDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [chama, setChama] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchChama()
  }, [])

  const fetchChama = async () => {
    try {
      const res = await axios.get(`${API}/chama/${id}`, { headers })
      setChama(res.data)
    } catch (err) {
      setError('Failed to load chama details')
    }
    setLoading(false)
  }

  if (loading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        {error && <p style={styles.error}>{error}</p>}

        {chama && (
          <>
            <div style={styles.header}>
              <h1 style={styles.title}>🤝 {chama.name}</h1>
              <p style={styles.desc}>{chama.description}</p>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{chama.members.length}</h3>
                <p style={styles.statLabel}>Members</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>KES {chama.totalBalance}</h3>
                <p style={styles.statLabel}>Total Balance</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>KES {chama.contributionAmount}</h3>
                <p style={styles.statLabel}>Contribution</p>
              </div>
              <div style={styles.statCard}>
                <h3 style={styles.statNumber}>{chama.contributionFrequency}</h3>
                <p style={styles.statLabel}>Frequency</p>
              </div>
            </div>

            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>👥 Members</h2>
              {chama.members.map((member, i) => (
                <div key={i} style={styles.memberRow}>
                  <span style={styles.memberName}>👤 {member.name}</span>
                  <span style={styles.memberEmail}>{member.email}</span>
                  <span style={styles.memberPhone}>{member.phone}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  content: { padding: '24px' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  header: { backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '12px', marginBottom: '24px' },
  title: { color: '#4CAF50', marginBottom: '8px' },
  desc: { color: '#ccc', fontSize: '14px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '24px', color: '#4CAF50', margin: '0 0 8px 0' },
  statLabel: { color: '#666', margin: 0, fontSize: '14px' },
  section: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  sectionTitle: { color: '#1a1a2e', marginBottom: '16px' },
  memberRow: { display: 'flex', gap: '24px', padding: '12px 0', borderBottom: '1px solid #f0f4f8', alignItems: 'center' },
  memberName: { fontWeight: 'bold', color: '#1a1a2e', flex: 1 },
  memberEmail: { color: '#666', fontSize: '14px', flex: 1 },
  memberPhone: { color: '#666', fontSize: '14px' },
}

export default ChamaDetails