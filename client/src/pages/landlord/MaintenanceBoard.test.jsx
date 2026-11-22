import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import MaintenanceBoard from './MaintenanceBoard'
import { AuthContext } from '../../context/AuthContext'
import { subscribeToOwnerRequests, updateRequestStatus } from '../../services/maintenanceService'

vi.mock('../../services/maintenanceService', () => ({
  subscribeToOwnerRequests: vi.fn(),
  updateRequestStatus: vi.fn(),
}))

const request = {
  id: 'm1',
  title: 'Leaking tap',
  description: 'Kitchen tap drips',
  status: 'open',
  unitName: 'A1',
  propertyName: 'Sunrise',
  tenantName: 'Amina',
}

function feed(list) {
  subscribeToOwnerRequests.mockImplementation((uid, onData) => {
    onData(list)
    return () => {}
  })
}

function renderPage() {
  render(
    <AuthContext.Provider value={{ user: { uid: 'l1' } }}>
      <MaintenanceBoard />
    </AuthContext.Provider>
  )
}

describe('MaintenanceBoard page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an empty state when there are no requests', () => {
    feed([])
    renderPage()
    expect(screen.getByText(/No maintenance requests yet/)).toBeInTheDocument()
  })

  it('puts a request in its status column', () => {
    feed([request])
    renderPage()

    expect(screen.getByText('Leaking tap')).toBeInTheDocument()
    expect(screen.getByText('Open (1)')).toBeInTheDocument()
    expect(screen.getByText('In progress (0)')).toBeInTheDocument()
  })

  it('shows an error when requests cannot be loaded', () => {
    subscribeToOwnerRequests.mockImplementation((uid, onData, onError) => {
      onError(new Error('denied'))
      return () => {}
    })
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load maintenance requests')
  })

  it('changes the status of a request', async () => {
    feed([request])
    updateRequestStatus.mockResolvedValue()
    renderPage()

    await userEvent.selectOptions(screen.getByLabelText('Status for Leaking tap'), 'in_progress')

    await waitFor(() => expect(updateRequestStatus).toHaveBeenCalledWith('m1', 'in_progress'))
  })

  it('shows an error when the status cannot be changed', async () => {
    feed([request])
    updateRequestStatus.mockRejectedValue(new Error('fail'))
    renderPage()

    await userEvent.selectOptions(screen.getByLabelText('Status for Leaking tap'), 'resolved')

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not update the request')
  })
})
