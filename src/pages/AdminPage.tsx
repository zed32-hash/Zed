import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'motion/react'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import {
  collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp,
  setDoc, getDoc,
} from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase/config'
import { useTheme } from '../contexts/ThemeContext'
import {
  ShieldAlert, Users, FileWarning, LogOut, Ban, CheckCircle2, RefreshCw,
  Moon, Sun, Trash2, Infinity, Settings, Clock,
} from 'lucide-react'

const ADMIN_EMAIL = 'officialzed.10@gmail.com'

interface UserRow {
  uid: string
  username: string
  status: string
  reportCount: number
  email?: string
  tags: string[]
  createdAt?: Timestamp
  unlimitedChat?: boolean
}

interface ReportRow {
  id: string
  reporterId: string
  reportedId: string
  reason: string
  timestamp?: Timestamp
  reporterUsername?: string
  reportedUsername?: string
}

export function AdminPage() {
  const { dark, toggleDark } = useTheme()
  const navigate = useNavigate()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'reports' | 'settings'>('users')
  const [users, setUsers] = useState<UserRow[]>([])
  const [reports, setReports] = useState<ReportRow[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [bannedIds, setBannedIds] = useState<Set<string>>(new Set())
  const [signInError, setSignInError] = useState('')
  const [blindDateTime, setBlindDateTime] = useState('20:00')
  const [blindDateSaved, setBlindDateSaved] = useState(false)
  const [savingTime, setSavingTime] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const bg = dark ? '#0A0914' : '#F4F0FC'
  const cardBg = dark ? 'rgba(28,18,54,0.8)' : 'rgba(255,255,255,0.9)'
  const border = dark ? 'rgba(124,58,237,0.25)' : 'rgba(92,49,242,0.15)'
  const text = dark ? '#F5F5FA' : '#1A173B'
  const muted = dark ? '#A6A4C5' : '#7B78A8'
  const inputBg = dark ? 'rgba(28,18,54,0.5)' : '#F3F0FC'

  useEffect(() => {
    if (!isFirebaseConfigured) { setAuthLoading(false); return }
    const unsub = auth.onAuthStateChanged((u) => {
      if (u && u.email === ADMIN_EMAIL) {
        setAdminUser(u)
      } else if (u) {
        signOut(auth)
        setAdminUser(null)
        setSignInError('Access denied. Only the designated admin account can access this panel.')
      } else {
        setAdminUser(null)
      }
      setAuthLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (adminUser) { fetchData(); fetchBlindDateTime() }
  }, [adminUser])

  const fetchData = async () => {
    setDataLoading(true)
    try {
      const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('username')))
      const usersData: UserRow[] = usersSnap.docs.map((d) => ({
        uid: d.id,
        username: d.data().username || '(no alias)',
        status: d.data().status || 'active',
        reportCount: d.data().reportCount || 0,
        tags: d.data().tags || [],
        email: d.data().email,
        createdAt: d.data().createdAt,
        unlimitedChat: d.data().unlimitedChat || false,
      }))
      setUsers(usersData)

      const reportsSnap = await getDocs(query(collection(db, 'reports'), orderBy('timestamp', 'desc')))
      const userMap = new Map(usersData.map((u) => [u.uid, u.username]))
      const reportsData: ReportRow[] = reportsSnap.docs.map((d) => ({
        id: d.id,
        reporterId: d.data().reporterId,
        reportedId: d.data().reportedId,
        reason: d.data().reason,
        timestamp: d.data().timestamp,
        reporterUsername: userMap.get(d.data().reporterId) || d.data().reporterId,
        reportedUsername: userMap.get(d.data().reportedId) || d.data().reportedId,
      }))
      setReports(reportsData)
    } catch (err) {
      console.error(err)
    }
    setDataLoading(false)
  }

  const fetchBlindDateTime = async () => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'happyHour'))
      if (snap.exists() && snap.data().time) {
        setBlindDateTime(snap.data().time)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleGoogleSignIn = async () => {
    setSignInError('')
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err: any) {
      setSignInError(err.message || 'Sign in failed.')
    }
  }

  const handleBan = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'suspended' })
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, status: 'suspended' } : u))
      setBannedIds((prev) => new Set([...prev, uid]))
    } catch (err) { console.error(err) }
  }

  const handleUnban = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status: 'active' })
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, status: 'active' } : u))
      setBannedIds((prev) => { const s = new Set(prev); s.delete(uid); return s })
    } catch (err) { console.error(err) }
  }

  const handleDelete = async (uid: string, username: string) => {
    if (!window.confirm(`Permanently delete @${username}? This cannot be undone.`)) return
    setDeletingId(uid)
    try {
      await deleteDoc(doc(db, 'users', uid))
      setUsers((prev) => prev.filter((u) => u.uid !== uid))
    } catch (err) {
      console.error(err)
      alert('Failed to delete user. They may need to be removed from Firebase Auth separately.')
    }
    setDeletingId(null)
  }

  const handleSetUnlimited = async (uid: string, enable: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { unlimitedChat: enable })
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, unlimitedChat: enable } : u))
    } catch (err) { console.error(err) }
  }

  const handleSaveBlindDateTime = async () => {
    setSavingTime(true)
    try {
      await setDoc(doc(db, 'settings', 'happyHour'), { time: blindDateTime }, { merge: true })
      setBlindDateSaved(true)
      setTimeout(() => setBlindDateSaved(false), 2500)
    } catch (err) {
      console.error(err)
    }
    setSavingTime(false)
  }

  const handleLogout = async () => {
    await signOut(auth)
    setAdminUser(null)
  }

  const formatDate = (ts?: Timestamp) => {
    if (!ts) return '—'
    try { return ts.toDate().toLocaleDateString() } catch { return '—' }
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #5C31F2', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!adminUser) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <button onClick={toggleDark} style={{ background: dark ? 'rgba(124,58,237,0.15)' : 'rgba(92,49,242,0.08)', border: `1px solid ${border}`, borderRadius: 12, padding: '8px', cursor: 'pointer', color: muted, display: 'flex', alignItems: 'center' }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 24, padding: '2.5rem', maxWidth: 420, width: '90%', backdropFilter: 'blur(24px)', boxShadow: '0 24px 64px rgba(92,49,242,0.12)', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <ShieldAlert size={26} color="#fff" />
          </div>
          <h1 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '1.75rem', fontWeight: 700, color: text, marginBottom: '0.5rem' }}>Admin Panel</h1>
          <p style={{ color: muted, fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.6 }}>Restricted access. Sign in with the authorized admin Google account to continue.</p>
          {signInError && (
            <div style={{ background: 'rgba(255,83,83,0.1)', border: '1px solid rgba(255,83,83,0.3)', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1rem' }}>
              <p style={{ color: '#FF5353', fontSize: '0.8rem' }}>{signInError}</p>
            </div>
          )}
          <button onClick={handleGoogleSignIn} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '0.875rem 1.5rem', borderRadius: 14, background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', color: '#fff', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(92,49,242,0.4)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Sign in with Google
          </button>
          <button onClick={() => navigate('/')} style={{ marginTop: '1rem', background: 'none', border: 'none', color: muted, fontSize: '0.8rem', cursor: 'pointer' }}>← Back to ZED</button>
        </motion.div>
      </div>
    )
  }

  const suspendedCount = users.filter((u) => u.status === 'suspended').length
  const highRiskCount = users.filter((u) => u.reportCount >= 2).length
  const unlimitedCount = users.filter((u) => u.unlimitedChat).length

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ background: cardBg, borderBottom: `1px solid ${border}`, backdropFilter: 'blur(20px)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#5C31F2,#7C3AED)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: text, lineHeight: 1 }}>ZED Admin</p>
            <p style={{ fontSize: '0.72rem', color: muted, marginTop: 2 }}>{adminUser.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={fetchData} disabled={dataLoading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 10, background: inputBg, border: `1px solid ${border}`, color: muted, fontSize: '0.8rem', cursor: 'pointer' }}>
            <RefreshCw size={13} style={{ animation: dataLoading ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
          </button>
          <button onClick={toggleDark} style={{ padding: '0.5rem', borderRadius: 10, background: inputBg, border: `1px solid ${border}`, color: muted, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1rem', borderRadius: 10, background: 'rgba(255,83,83,0.1)', border: '1px solid rgba(255,83,83,0.25)', color: '#FF5353', fontSize: '0.8rem', cursor: 'pointer' }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: '2rem' }}>
          {[
            { label: 'Total Users', value: users.length, color: '#5C31F2' },
            { label: 'Active', value: users.filter((u) => u.status === 'active').length, color: '#22C55E' },
            { label: 'Suspended', value: suspendedCount, color: '#FF5353' },
            { label: 'High Risk (2+)', value: highRiskCount, color: '#FF844B' },
            { label: 'Pro (Unlimited)', value: unlimitedCount, color: '#7C3AED' },
            { label: 'Total Reports', value: reports.length, color: '#ec4899' },
          ].map((stat) => (
            <div key={stat.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '1.25rem 1.5rem', backdropFilter: 'blur(12px)' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: muted, marginBottom: 6 }}>{stat.label}</p>
              <p style={{ fontFamily: "'Clash Display', sans-serif", fontSize: '2rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {([
            { key: 'users', label: `Users (${users.length})`, icon: <Users size={14} /> },
            { key: 'reports', label: `Reports (${reports.length})`, icon: <FileWarning size={14} /> },
            { key: 'settings', label: 'Settings', icon: <Settings size={14} /> },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1.25rem', borderRadius: 12, background: tab === t.key ? 'linear-gradient(135deg,#5C31F2,#7C3AED)' : inputBg, border: `1px solid ${tab === t.key ? '#5C31F2' : border}`, color: tab === t.key ? '#fff' : muted, fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'settings' ? (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Blind Date Time */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, padding: '2rem', backdropFilter: 'blur(12px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,83,83,0.12)', border: '1px solid rgba(255,83,83,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={18} color="#FF5353" />
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Clash Display', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: text }}>Blind Date (Happy Hour) Time</h3>
                  <p style={{ color: muted, fontSize: '0.8rem', marginTop: 2 }}>Set the daily time when blind matching activates for all users.</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="time"
                  value={blindDateTime}
                  onChange={(e) => setBlindDateTime(e.target.value)}
                  style={{ padding: '0.75rem 1rem', borderRadius: 12, background: inputBg, border: `1px solid ${border}`, color: text, fontSize: '1.1rem', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, outline: 'none', cursor: 'pointer' }}
                />
                <button
                  onClick={handleSaveBlindDateTime}
                  disabled={savingTime}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: 12, background: blindDateSaved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg,#5C31F2,#7C3AED)', border: blindDateSaved ? '1px solid rgba(34,197,94,0.4)' : 'none', color: blindDateSaved ? '#22C55E' : '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s' }}>
                  {blindDateSaved ? '✓ Saved!' : savingTime ? 'Saving…' : 'Save Time'}
                </button>
              </div>
              <p style={{ color: muted, fontSize: '0.78rem', marginTop: '1rem' }}>
                Current setting: <strong style={{ color: text }}>{blindDateTime}</strong> daily. Changes apply to the Happy Hour countdown immediately.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
            {dataLoading ? (
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #5C31F2', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : tab === 'users' ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      {['Alias', 'Status', 'Reports', 'Tags', 'Joined', 'Pro Chat', 'Actions'].map((h) => (
                        <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: muted, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.uid} style={{ borderBottom: i < users.length - 1 ? `1px solid ${border}` : 'none', background: u.status === 'suspended' ? (dark ? 'rgba(255,83,83,0.04)' : 'rgba(255,83,83,0.02)') : 'transparent' }}>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}&size=32`} alt="" style={{ width: 32, height: 32, borderRadius: '50%', background: '#E3DCF8', flexShrink: 0 }} />
                            <div>
                              <p style={{ fontWeight: 700, color: text, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{u.username}</p>
                              <p style={{ fontSize: '0.72rem', color: muted, fontFamily: 'monospace' }}>{u.uid.slice(0, 10)}…</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700, background: u.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(255,83,83,0.1)', color: u.status === 'active' ? '#22C55E' : '#FF5353', border: `1px solid ${u.status === 'active' ? 'rgba(34,197,94,0.25)' : 'rgba(255,83,83,0.25)'}`, whiteSpace: 'nowrap' }}>
                            {u.status === 'active' ? <CheckCircle2 size={10} /> : <Ban size={10} />}
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ fontWeight: 700, color: u.reportCount >= 3 ? '#FF5353' : u.reportCount >= 2 ? '#FF844B' : text, fontSize: '0.875rem' }}>{u.reportCount}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', maxWidth: 160 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {u.tags.slice(0, 2).map((tag) => (
                              <span key={tag} style={{ fontSize: '0.68rem', background: inputBg, border: `1px solid ${border}`, borderRadius: 999, padding: '0.15rem 0.5rem', color: muted }}>{tag}</span>
                            ))}
                            {u.tags.length > 2 && <span style={{ fontSize: '0.68rem', color: muted }}>+{u.tags.length - 2}</span>}
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span style={{ fontSize: '0.8rem', color: muted, whiteSpace: 'nowrap' }}>{formatDate(u.createdAt)}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {u.unlimitedChat ? (
                            <button onClick={() => handleSetUnlimited(u.uid, false)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.75rem', borderRadius: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)', color: '#7C3AED', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              <Infinity size={11} /> Pro ✓
                            </button>
                          ) : (
                            <button onClick={() => handleSetUnlimited(u.uid, true)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.35rem 0.75rem', borderRadius: 8, background: inputBg, border: `1px solid ${border}`, color: muted, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Activate
                            </button>
                          )}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {u.status === 'active' ? (
                              <button onClick={() => handleBan(u.uid)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.75rem', borderRadius: 8, background: 'rgba(255,83,83,0.1)', border: '1px solid rgba(255,83,83,0.25)', color: '#FF5353', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Ban size={11} /> Ban
                              </button>
                            ) : (
                              <button onClick={() => handleUnban(u.uid)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.75rem', borderRadius: 8, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                                <CheckCircle2 size={11} /> Unban
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(u.uid, u.username)}
                              disabled={deletingId === u.uid}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.4rem 0.75rem', borderRadius: 8, background: 'rgba(255,83,83,0.06)', border: '1px solid rgba(255,83,83,0.18)', color: '#FF5353', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', opacity: deletingId === u.uid ? 0.5 : 1 }}>
                              <Trash2 size={11} /> {deletingId === u.uid ? '…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: muted }}>No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${border}` }}>
                      {['Reporter', 'Reported User', 'Reason', 'Date'].map((h) => (
                        <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: muted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: i < reports.length - 1 ? `1px solid ${border}` : 'none' }}>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{ fontWeight: 600, color: text, fontSize: '0.875rem' }}>{r.reporterUsername}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: '#FF5353', fontSize: '0.875rem' }}>{r.reportedUsername}</span>
                            {users.find((u) => u.uid === r.reportedId)?.status === 'active' && (
                              <button onClick={() => handleBan(r.reportedId)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0.2rem 0.6rem', borderRadius: 6, background: 'rgba(255,83,83,0.1)', border: '1px solid rgba(255,83,83,0.25)', color: '#FF5353', fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Ban size={9} /> Ban
                              </button>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem', maxWidth: 300 }}>
                          <span style={{ fontSize: '0.875rem', color: muted, lineHeight: 1.5 }}>{r.reason}</span>
                        </td>
                        <td style={{ padding: '0.875rem 1.25rem' }}>
                          <span style={{ fontSize: '0.8rem', color: muted }}>{formatDate(r.timestamp)}</span>
                        </td>
                      </tr>
                    ))}
                    {reports.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: muted }}>No reports on file.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
