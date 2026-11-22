import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { getDoc, setDoc } from 'firebase/firestore'
import {
  getAuthErrorMessage,
  loginUser,
  loginWithGoogle,
  logoutUser,
  registerUser,
} from './authService'

vi.mock('./firebase', () => ({ auth: {}, db: {}, googleProvider: {} }))
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
}))
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => 'doc-ref'),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'timestamp'),
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('registers a user and saves their profile', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } })

    const user = await registerUser({
      name: 'Amina',
      email: 'amina@example.com',
      password: 'secret123',
      role: 'tenant',
    })

    expect(updateProfile).toHaveBeenCalledWith({ uid: 'u1' }, { displayName: 'Amina' })
    expect(setDoc).toHaveBeenCalledWith('doc-ref', {
      name: 'Amina',
      email: 'amina@example.com',
      role: 'tenant',
      createdAt: 'timestamp',
    })
    expect(user).toEqual({ uid: 'u1' })
  })

  it('logs a user in', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } })

    const user = await loginUser({ email: 'amina@example.com', password: 'secret123' })

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'amina@example.com', 'secret123')
    expect(user).toEqual({ uid: 'u1' })
  })

  it('creates a tenant profile the first time someone signs in with Google', async () => {
    signInWithPopup.mockResolvedValue({
      user: { uid: 'g1', displayName: 'Gina', email: 'gina@example.com' },
    })
    getDoc.mockResolvedValue({ exists: () => false })

    await loginWithGoogle()

    expect(setDoc).toHaveBeenCalledWith('doc-ref', {
      name: 'Gina',
      email: 'gina@example.com',
      role: 'tenant',
      createdAt: 'timestamp',
    })
  })

  it('keeps the existing profile when a Google user returns', async () => {
    signInWithPopup.mockResolvedValue({
      user: { uid: 'g1', displayName: 'Gina', email: 'gina@example.com' },
    })
    getDoc.mockResolvedValue({ exists: () => true })

    await loginWithGoogle()

    expect(setDoc).not.toHaveBeenCalled()
  })

  it('logs a user out', async () => {
    await logoutUser()
    expect(signOut).toHaveBeenCalledTimes(1)
  })

  it('turns Firebase error codes into readable messages', () => {
    expect(getAuthErrorMessage('auth/email-already-in-use')).toContain('already exists')
    expect(getAuthErrorMessage('auth/invalid-email')).toContain('not valid')
    expect(getAuthErrorMessage('auth/weak-password')).toContain('stronger')
    expect(getAuthErrorMessage('auth/invalid-credential')).toContain('Incorrect')
    expect(getAuthErrorMessage('auth/user-not-found')).toContain('Incorrect')
    expect(getAuthErrorMessage('auth/wrong-password')).toContain('Incorrect')
    expect(getAuthErrorMessage('auth/too-many-requests')).toContain('Too many')
    expect(getAuthErrorMessage('auth/popup-closed-by-user')).toContain('closed')
    expect(getAuthErrorMessage('auth/network-request-failed')).toContain('Network')
    expect(getAuthErrorMessage('something-else')).toContain('Something went wrong')
  })
})
