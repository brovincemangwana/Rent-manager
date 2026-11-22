import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Maintenance from './Maintenance'
import { AuthContext } from '../../context/AuthContext'
import { subscribeToTenantUnits } from '../../services/unitService'
import { addRequest, subscribeToTenantRequests } from '../../services/maintenanceService'

vi.mock('../../services/unitService', () => ({
  subscribeToTenantUnits: vi.fn(),
}))
vi.mock('../../services/maintenanceService', () => ({
  subscribeToTenantRequests: vi.fn(),
  addRequest: vi.fn(),
}))

const unit = { id: 'u1', name: 'A1', propertyName: 'Sunrise', ownerId: 'l1' }

function feed(units, requests) {
  subscribeToTenantUnits.mockImplementation((uid, onData) => {
    onData(units)
    return () => {}
  })
  subscribeToTenantRequests.mockImplementation((uid, onData) => {
    onData(requests)
    return () => {}
  })
}

function renderPage() {
  render(
    <AuthContext.Provider value={{ user: { uid: 't1' }, profile: { name: 'Amina' } }}>
      <Maintenance />
    </AuthContext.Provider>
  )
}

async function fillAndSubmit() {
  await userEvent.selectOptions(screen.getByLabelText('Unit'), 'u1')
  await userEvent.type(screen.getByLabelText('Title'), 'Leaking tap')
  await userEvent.type(screen.getByLabelText('Description'), 'Kitchen tap drips')
  await userEvent.click(screen.getByRole('button', { name: 'Send request' }))
}

describe('Tenant Maintenance page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('tells a tenant without a unit to ask their landlord', () => {
    feed([], [])
    renderPage()
    expect(screen.getByText(/not linked to a unit yet/)).toBeInTheDocument()
  })

  it('shows an empty list when no requests have been sent', () => {
    feed([unit], [])
    renderPage()
    expect(screen.getByText(/You have not sent any requests yet/)).toBeInTheDocument()
  })

  it('lists existing requests with their status', () => {
    feed([unit], [
      {
        id: 'm1',
        title: 'Leaking tap',
        description: 'Drips',
        status: 'in_progress',
        unitName: 'A1',
        propertyName: 'Sunrise',
      },
    ])
    renderPage()

    expect(screen.getByText('Leaking tap')).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
  })

  it('sends a request', async () => {
    feed([unit], [])
    addRequest.mockResolvedValue({})
    renderPage()

    await fillAndSubmit()

    await waitFor(() =>
      expect(addRequest).toHaveBeenCalledWith(
        { uid: 't1', name: 'Amina' },
        { unitId: 'u1', title: 'Leaking tap', description: 'Kitchen tap drips' },
        unit
      )
    )
    expect(await screen.findByRole('status')).toHaveTextContent('Request sent')
  })

  it('shows an error when sending fails', async () => {
    feed([unit], [])
    addRequest.mockRejectedValue(new Error('fail'))
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not send the request')
  })
})
