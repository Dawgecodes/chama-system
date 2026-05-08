import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'

const API = 'http://localhost:5000/api'

function Dashboard() {
  const navigate = useNavigate()
  const [chamas, setChamas] = useState([])
  const [myContributions, setMyContributions] = useState([])
  const [myLoans, setMyLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateChama, setShowCreateChama] = useState(false)
  const [showContribute, setShowContribute] = useState(false)
  const [showLoan, setShowLoan] = useState(false)
  const [selectedChama, setSelectedChama] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [chamaForm, setChamaForm] = useState({
    name: '', description: '', contributionAmount: '', contributionFrequency: 'monthly'
  })
  const [contributeForm, setContributeForm] = useState({ phone: '', amount: '' })
  const [loanForm, setLoanForm] = useState({ amount: '', reason: '' })

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [chamasRes, contribRes, loansRes] = await Promise.all([
        axios.get(`${API}/chama/all`, { headers }),
        axios.get(`${API}/contributions/my`, { headers }),
        axios.get(`${API}/loans/my`, { headers }),
      ])
      setChamas(chamasRes.data)
      setMyContributions(contribRes.data)
      setMyLoans(loansRes.data)
    } catch (err) {
      setError('Failed to load data')
    }
    setLoading(false)
  }

  const handleCreateChama = async () => {
    try {
      await axios.post(`${API}/chama/create`, chamaForm, { headers })
      setMessage('✅ Chama created successfully!')
      setShowCreateChama(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create chama')
    }
  }

  const handleJoinChama = async (chamaId) => {
    try {
      await axios.post(`${API}/chama/join/${chamaId}`, {}, { headers })
      setMessage('✅ Joined chama successfully!')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join chama')
    }
  }

  const handleContribute = async () => {
    try {
      await axios.post(`${API}/contributions/contribute`, {
        ...contributeForm,
        chamaId: selectedChama
      }, { headers })
      setMessage('✅ Payment request sent! Check your phone for PIN prompt.')
      setShowContribute(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to contribute')
    }
  }

  const handleLoan = async () => {
    try {
      await axios.post(`${API}/loans/apply`, {
        ...loanForm,
        chamaId: selectedChama
      }, { headers })
      setMessage('✅ Loan application submitted!')
      setShowLoan(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply for loan')
    }
  }

  const totalContributed = myContributions
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.amount, 0)

  if (loading) return <div style={styles.loading}>Loading...</div>

  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.content}>
        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{chamas.length}</h3>
            <p style={styles.statLabel}>Available Chamas</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{myContributions.length}</h3>
            <p style={styles.statLabel}>My Contributions</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>KES {totalContributed}</h3>
            <p style={styles.statLabel}>Total Contributed</p>
          </div>
          <div style={styles.statCard}>
            <h3 style={styles.statNumber}>{myLoans.length}</h3>
            <p style={styles.statLabel}>My Loans</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button style={styles.actionBtn} onClick={() => setShowCreateChama(true)}>
            ➕ Create Chama
          </button>
          <button style={styles.actionBtn2} onClick={() => setShowContribute(true)}>
            💰 Contribute
          </button>
          <button style={styles.actionBtn3} onClick={() => setShowLoan(true)}>
            🏦 Apply for Loan
          </button>
        </div>

        {/* Create Chama Form */}
        {showCreateChama && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Chama</h3>
            <input style={styles.input} placeholder="Chama Name"
              value={chamaForm.name}
              onChange={e => setChamaForm({...chamaForm, name: e.target.value})} />
            <input style={styles.input} placeholder="Description"
              value={chamaForm.description}
              onChange={e => setChamaForm({...chamaForm, description: e.target.value})} />
            <input style={styles.input} placeholder="Contribution Amount (KES)" type="number"
              value={chamaForm.contributionAmount}
              onChange={e => setChamaForm({...chamaForm, contributionAmount: e.target.value})} />
            <select style={styles.input}
              value={chamaForm.contributionFrequency}
              onChange={e => setChamaForm({...chamaForm, contributionFrequency: e.target.value})}>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
            <div style={styles.formButtons}>
              <button style={styles.submitBtn} onClick={handleCreateChama}>Create</button>
              <button style={styles.cancelBtn} onClick={() => setShowCreateChama(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Contribute Form */}
        {showContribute && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>💰 Make Contribution</h3>
            <select style={styles.input}
              onChange={e => setSelectedChama(e.target.value)}>
              <option value="">Select Chama</option>
              {chamas.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <input style={styles.input} placeholder="Phone (e.g. 254708374149)"
              value={contributeForm.phone}
              onChange={e => setContributeForm({...contributeForm, phone: e.target.value})} />
            <input style={styles.input} placeholder="Amount (KES)" type="number"
              value={contributeForm.amount}
              onChange={e => setContributeForm({...contributeForm, amount: e.target.value})} />
            <div style={styles.formButtons}>
              <button style={styles.submitBtn} onClick={handleContribute}>Pay via M-Pesa</button>
              <button style={styles.cancelBtn} onClick={() => setShowContribute(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Loan Form */}
        {showLoan && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>🏦 Apply for Loan</h3>
            <select style={styles.input}
              onChange={e => setSelectedChama(e.target.value)}>
              <option value="">Select Chama</option>
              {chamas.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <input style={styles.input} placeholder="Amount (KES)" type="number"
              value={loanForm.amount}
              onChange={e => setLoanForm({...loanForm, amount: e.target.value})} />
            <input style={styles.input} placeholder="Reason for loan"
              value={loanForm.reason}
              onChange={e => setLoanForm({...loanForm, reason: e.target.value})} />
            <div style={styles.formButtons}>
              <button style={styles.submitBtn} onClick={handleLoan}>Apply</button>
              <button style={styles.cancelBtn} onClick={() => setShowLoan(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Chamas List */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Available Chamas</h2>
          {chamas.length === 0 ? (
            <p style={styles.empty}>No chamas yet. Create one!</p>
          ) : (
            <div style={styles.chamaGrid}>
              {chamas.map(chama => (
                <div key={chama._id} style={styles.chamaCard}>
                  <h3 style={styles.chamaName}>{chama.name}</h3>
                  <p style={styles.chamaDesc}>{chama.description}</p>
                  <p style={styles.chamaMeta}>💰 KES {chama.contributionAmount} / {chama.contributionFrequency}</p>
                  <p style={styles.chamaMeta}>👥 {chama.members.length} members</p>
                  <p style={styles.chamaMeta}>🏦 Balance: KES {chama.totalBalance}</p>
                  <button
                    style={styles.joinBtn}
                    onClick={() => handleJoinChama(chama._id)}
                  >
                    Join Chama
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Contributions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>My Contributions</h2>
          {myContributions.length === 0 ? (
            <p style={styles.empty}>No contributions yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Chama</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {myContributions.map((c, i) => (
                  <tr key={i} style={styles.tableRow}>
                    <td style={styles.td}>{c.chama?.name}</td>
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

        {/* My Loans */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>My Loans</h2>
          {myLoans.length === 0 ? (
            <p style={styles.empty}>No loans yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Chama</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {myLoans.map((l, i) => (
                  <tr key={i} style={styles.tableRow}>
                    <td style={styles.td}>{l.chama?.name}</td>
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
  success: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  error: { backgroundColor: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', marginBottom: '16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNumber: { fontSize: '24px', color: '#4CAF50', margin: '0 0 8px 0' },
  statLabel: { color: '#666', margin: 0, fontSize: '14px' },
  actions: { display: 'flex', gap: '12px', marginBottom: '24px' },
  actionBtn: { padding: '12px 24px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  actionBtn2: { padding: '12px 24px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  actionBtn3: { padding: '12px 24px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  formCard: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '24px', maxWidth: '400px' },
  formTitle: { marginBottom: '16px', color: '#1a1a2e' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' },
  formButtons: { display: 'flex', gap: '12px' },
  submitBtn: { flex: 1, padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  section: { backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '24px' },
  sectionTitle: { color: '#1a1a2e', marginBottom: '16px' },
  empty: { color: '#666', textAlign: 'center', padding: '20px' },
  chamaGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  chamaCard: { backgroundColor: '#f0f4f8', padding: '20px', borderRadius: '12px' },
  chamaName: { color: '#1a1a2e', marginBottom: '8px' },
  chamaDesc: { color: '#666', fontSize: '14px', marginBottom: '8px' },
  chamaMeta: { color: '#444', fontSize: '14px', marginBottom: '4px' },
  joinBtn: { marginTop: '12px', width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { backgroundColor: '#f0f4f8' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#666', fontWeight: '600', fontSize: '14px' },
  tableRow: { borderBottom: '1px solid #f0f4f8' },
  td: { padding: '14px 16px', color: '#333', fontSize: '14px' },
  badge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: 'bold' },
}

export default Dashboard