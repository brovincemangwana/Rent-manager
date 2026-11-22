import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import ProtectedRoute from './ProtectedRoute'
import { AuthContext } from '../context/AuthContext'

function renderAt(value, role) {
  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/secret']}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="/dashboard" element={<p>Dashboard redirect</p>} />
          <Route element={<ProtectedRoute role={role} />}>
            <Route path="/secret" element={<p>Secret page</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('ProtectedRoute', () => {
  it('sends logged out visitors to the login page', () => {
    renderAt({ user: null, profile: null })
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('lets a logged in user through when no role is required', () => {
    renderAt({ user: { uid: '1' }, profile: { role: 'tenant' } })
    expect(screen.getByText('Secret page')).toBeInTheDocument()
  })

  it('lets a user with the right role through', () => {
    renderAt({ user: { uid: '1' }, profile: { role: 'landlord' } }, 'landlord')
    expect(screen.getByText('Secret page')).toBeInTheDocument()
  })

  it('redirects a user with the wrong role', () => {
    renderAt({ user: { uid: '1' }, profile: { role: 'tenant' } }, 'landlord')
    expect(screen.getByText('Dashboard redirect')).toBeInTheDocument()
  })
})
