import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Navbar from './Navbar'
import { AuthContext } from '../context/AuthContext'

vi.mock('../services/authService', () => ({
  logoutUser: vi.fn(),
}))

function renderNavbar(user, profile = null) {
  render(
    <AuthContext.Provider value={{ user, profile }}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('Navbar', () => {
  it('shows login and register links when logged out', () => {
    renderNavbar(null)

    expect(screen.getByText('Rent Manager')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register')
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument()
  })

  it('shows a log out button when logged in', () => {
    renderNavbar({ uid: '123' })

    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Log in' })).not.toBeInTheDocument()
  })

  it('shows landlord links for a landlord', () => {
    renderNavbar({ uid: '123' }, { role: 'landlord' })

    expect(screen.getByRole('link', { name: 'Properties' })).toHaveAttribute('href', '/landlord/properties')
    expect(screen.getByRole('link', { name: 'Rent' })).toHaveAttribute('href', '/landlord/rent')
  })
})
