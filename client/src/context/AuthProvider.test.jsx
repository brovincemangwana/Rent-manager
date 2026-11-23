import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AuthProvider from './AuthProvider'
import { useAuth } from './AuthContext'
import { onAuthStateChanged } from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'

vi.mock('../services/firebase', () => ({ auth: {}, db: {} }))
vi.mock('firebase/auth', () => ({ onAuthStateChanged: vi.fn() }))
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), onSnapshot: vi.fn() }))

function Show() {
  const { user, profile } = useAuth()
  return <p>{`${user ? 'in' : 'out'}:${profile?.role ?? 'none'}`}</p>
}

function renderProvider() {
  render(
    <AuthProvider>
      <Show />
    </AuthProvider>
  )
}

function signIn(user) {
  onAuthStateChanged.mockImplementation((auth, callback) => {
    callback(user)
    return () => {}
  })
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows no user when logged out', async () => {
    signIn(null)
    renderProvider()
    expect(await screen.findByText('out:none')).toBeInTheDocument()
  })

  it('loads the profile for a logged in user', async () => {
    signIn({ uid: 'u1' })
    onSnapshot.mockImplementation((ref, onNext) => {
      onNext({ exists: () => true, data: () => ({ role: 'tenant' }) })
      return () => {}
    })
    renderProvider()
    expect(await screen.findByText('in:tenant')).toBeInTheDocument()
  })

  it('handles a user with no profile document', async () => {
    signIn({ uid: 'u1' })
    onSnapshot.mockImplementation((ref, onNext) => {
      onNext({ exists: () => false })
      return () => {}
    })
    renderProvider()
    expect(await screen.findByText('in:none')).toBeInTheDocument()
  })

  it('still renders when the profile cannot be read', async () => {
    signIn({ uid: 'u1' })
    onSnapshot.mockImplementation((ref, onNext, onError) => {
      onError(new Error('denied'))
      return () => {}
    })
    renderProvider()
    expect(await screen.findByText('in:none')).toBeInTheDocument()
  })
})
