import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

const API = 'http://localhost:5000/api'

function AdminDashboard() {
  const navigate = useNavigate()
  const [chama, setChama] = useState(null)
  const [contributions, setContributions] = useState([])
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    if (user.role !== 'admin') { navigate('/dashboard'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const chamasRes = await axios.get(`${API}/chama/all`, { headers })
      const myChama = chamasRes.data.find(c => c.admin._id === user.id)
      if (myChama) {
        setChama(myChama)
        const [contribRes, loansRes] = await Promise.all([
          axios.get(`${API}/contributions/chama/${myChama._id}`, { headers }),
          axios.get(`${API}/loans/chama/${myChama._id}`, { headers }),
        ])
        setContributions(contribRes.data)
        setLoans(loansRes.data)
      }
    } catch (err) {
      setError('Failed to load data')
    }
    setLoading(false)
  }

  const handleLoanUpdate = async (loanId, status) => {
    try {
      await axios.put(`${API}/loans/update/${loanId}`, { status }, { headers })
      setMessage(`✅ Loan ${status} successfully!`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update loan')
    }
  }

  const totalContributions = contributions
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0)

  const pendingLoans = loans.filter(l => l.status === 'pending')

  if (loading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <h1 style={styles.pageTitle}>⚙️ Admin Dashboard</h1>

        {/* Chama Info */}
        {chama && (
          <div style={styles.chamaInfo}>
            <h2 style={styles.chamaName}>🤝 {chama.name}</h2>
            <p style={styles.chamaDesc}>{chama.description}</p>
          </div>
        )}

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{chama?.members?.length || 0}</h3>
            <p style={styles.statLabel}>Total Members</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>KES {chama?.totalBalance || 0}</h3>
            <p style={styles.statLabel}>Chama Balance</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>KES {totalContributions}</h3>
            <p style={styles.statLabel}>Total Collected</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{pendingLoans.length}</h3>
            <p style={styles.statLabel}>Pending Loans</p>
          </div>
        </div>

        {/* Pending Loans */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>🏦 Pending Loan Requests</h2>
          {pendingLoans.length === 0 ? (
            <p style={styles.empty}>No pending loan requests</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Member</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLoans.map((loan, i) => (
                  <tr key={i} style={styles.tableRow}>
                    <td style={styles.td}>{loan.member?.name}</td>
                    <td style={styles.td}>KES {loan.amount}</td>
                    <td style={styles.td}>{loan.reason}</td>
                    <td style={styles.td}>{new Date(loan.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleLoanUpdate(loan._id, 'approved')}
                      >
                        ✅ Approve
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => handleLoanUpdate(loan._id, 'rejected')}
                      >
                        ❌ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* All Contributions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>💰 All Contributions</h2>
          {contributions.length === 0 ? (
            <p style={styles.empty}>No contributions yet</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Member</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {contributions.map((c, i) => (
                  <tr key={i} style={styles.tableRow}>
                    <td style={styles.td}>{c.member?.name}</td>
                    <td style={styles.td}>{c.member?.phone}</td>
                    <td style={styles.td}>KES {c.amount}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: c.status === 'completed' ? '#4CAF50' : c.status === 'failed' ? '#f44336' : '#FF9800'
                      }}>
                        {c.status}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* All Loans */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 All Loans</h2>
          {loans.length === 0 ? (
            <p style={styles.empty}>No loans yet</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Member</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((l, i) => (
                  <tr key={i} style={styles.tableRow}>
                    <td style={styles.td}>{l.member?.name}</td>
                    <td style={styles.td}>KES {l.amount}</td>
                    <td style={styles.td}>{l.reason}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: l.status === 'approved' ? '#4CAF50' : l.status === 'rejected' ? '#f44336' : '#FF9800'
                      }}>
                        {l.status}
                      </span>
                    </td>
                    <td style={styles.td}>{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  content: { padding: '24px' },
  loading: { textAlign: 'center', padding: '40px', fontSize: '18px' },
  pageTitle: { color: '#1a1a2e', marginBottom: '24px' },
  success: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  chamaInfo: { backgroundColor: '#1a1a2e', padding: '24px', borderRadius: '12px', marginBottom: '24px' },
  chamaName: { color: '#4CAF50', marginBottom: '8px' },
  chamaDesc: { color: '#ccc', fontSize: '14px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '24px', color: '#4CAF50', margin: '0 0 8px 0' },
  statLabel: { color: '#666', margin: 0, fontSize: '14px' },
  section: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '24px' },
  sectionTitle: { color: '#1a1a2e', marginBottom: '16px' },
  empty: { color: '#666', textAlign: 'center', padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { backgroundColor: '#f0f4f8' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: '600', fontSize: '14px' },
  tableRow: { borderBottom: '1px solid #f0f4f8' },
  td: { padding: '14px 16px', color: '#333', fontSize: '14px' },
  badge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
  approveBtn: { padding: '6px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '12px' },
  rejectBtn: { padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
}

export default AdminDashboard
