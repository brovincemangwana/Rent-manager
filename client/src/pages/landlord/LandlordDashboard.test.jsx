import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import LandlordDashboard from './LandlordDashboard'
import { AuthContext } from '../../context/AuthContext'

describe('LandlordDashboard', () => {
  it('greets the landlord and links to each section', () => {
    render(
      <AuthContext.Provider value={{ profile: { name: 'Lan' } }}>
        <MemoryRouter>
          <LandlordDashboard />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    expect(screen.getByText(/Welcome, Lan/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Manage properties' })).toHaveAttribute('href', '/landlord/properties')
    expect(screen.getByRole('link', { name: 'Units and tenants' })).toHaveAttribute('href', '/landlord/units')
    expect(screen.getByRole('link', { name: 'Rent ledger' })).toHaveAttribute('href', '/landlord/rent')
  })
})
