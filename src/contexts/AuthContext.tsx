import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase/config'

export interface UserProfile {
  uid: string
  username: string
  avatarUrl: string
  bio: string
  tags: string[]
  isGhostMode: boolean
  dailyMessageCount: number
  lastMessageReset: Date | null
  status: 'active' | 'suspended'
  reportCount: number
  location: { geohash: string; lat: number; lng: number } | null
  unlimitedChat?: boolean
}

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  needsOnboarding: boolean
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  const loadProfile = async (uid: string) => {
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const data = snap.data()
      setProfile({
        uid,
        username: data.username || '',
        avatarUrl: data.avatarUrl || '',
        bio: data.bio || '',
        tags: data.tags || [],
        isGhostMode: data.isGhostMode || false,
        dailyMessageCount: data.dailyMessageCount || 0,
        lastMessageReset: data.lastMessageReset?.toDate() || null,
        status: data.status || 'active',
        reportCount: data.reportCount || 0,
        location: data.location || null,
        unlimitedChat: data.unlimitedChat || false,
      })
      setNeedsOnboarding(!data.username)
    } else {
      setProfile(null)
      setNeedsOnboarding(true)
    }
  }

  const refreshProfile = async () => {
    if (user) await loadProfile(user.uid)
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        await loadProfile(u.uid)
      } else {
        setProfile(null)
        setNeedsOnboarding(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signUpWithEmail = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      username: '',
      avatarUrl: '',
      bio: '',
      tags: [],
      isGhostMode: false,
      dailyMessageCount: 0,
      lastMessageReset: null,
      status: 'active',
      reportCount: 0,
      location: null,
    })
    setNeedsOnboarding(true)
  }

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    const ref = doc(db, 'users', cred.user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: cred.user.uid,
        username: '',
        avatarUrl: '',
        bio: '',
        tags: [],
        isGhostMode: false,
        dailyMessageCount: 0,
        lastMessageReset: null,
        status: 'active',
        reportCount: 0,
        location: null,
      })
      setNeedsOnboarding(true)
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setProfile(null)
    setNeedsOnboarding(false)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, needsOnboarding, signUpWithEmail, signInWithEmail, signInWithGoogle, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
