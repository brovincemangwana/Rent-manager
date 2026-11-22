import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import Navbar from './Navbar'
import { AuthContext } from '../context/AuthContext'
import { logoutUser } from '../services/authService'

vi.mock('../services/authService', () => ({
  logoutUser: vi.fn(),
}))

function renderNavbar(profile) {
  render(
    <AuthContext.Provider value={{ user: { uid: '1' }, profile }}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('Navbar actions', () => {
  it('logs the user out when Log out is clicked', async () => {
    renderNavbar({ role: 'tenant' })

    await userEvent.click(screen.getByRole('button', { name: 'Log out' }))

    expect(logoutUser).toHaveBeenCalledTimes(1)
  })

  it('shows tenant links for a tenant', () => {
    renderNavbar({ role: 'tenant' })

    expect(screen.getByRole('link', { name: 'My rent' })).toHaveAttribute('href', '/tenant')
    expect(screen.getByRole('link', { name: 'Maintenance' })).toHaveAttribute('href', '/tenant/maintenance')
  })
})
