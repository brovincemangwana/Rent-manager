import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import DashboardRedirect from './DashboardRedirect'
import { AuthContext } from '../context/AuthContext'

function renderRedirect(profile) {
  render(
    <AuthContext.Provider value={{ profile }}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/landlord" element={<p>Landlord page</p>} />
          <Route path="/tenant" element={<p>Tenant page</p>} />
          <Route path="/" element={<p>Home page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('DashboardRedirect', () => {
  it('sends a landlord to the landlord dashboard', () => {
    renderRedirect({ role: 'landlord' })
    expect(screen.getByText('Landlord page')).toBeInTheDocument()
  })

  it('sends a tenant to the tenant dashboard', () => {
    renderRedirect({ role: 'tenant' })
    expect(screen.getByText('Tenant page')).toBeInTheDocument()
  })

  it('sends everyone else to the home page', () => {
    renderRedirect(null)
    expect(screen.getByText('Home page')).toBeInTheDocument()
  })
})
