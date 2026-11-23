import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TenantDashboard from './TenantDashboard'
import { AuthContext } from '../../context/AuthContext'
import {
  recordPayment,
  subscribeToTenantPayments,
  subscribeToTenantRecords,
} from '../../services/rentService'

vi.mock('../../services/rentService', () => ({
  subscribeToTenantRecords: vi.fn(),
  subscribeToTenantPayments: vi.fn(),
  recordPayment: vi.fn(),
}))

const record = {
  id: 'r1',
  ownerId: 'l1',
  tenantId: 't1',
  unitId: 'u1',
  unitName: 'A1',
  propertyName: 'Sunrise',
  month: '2026-11',
  amountDue: 15000,
  amountPaid: 5000,
}

function feed(records, payments = []) {
  subscribeToTenantRecords.mockImplementation((uid, onData) => {
    onData(records)
    return () => {}
  })
  subscribeToTenantPayments.mockImplementation((uid, onData) => {
    onData(payments)
    return () => {}
  })
}

function renderPage() {
  render(
    <AuthContext.Provider value={{ user: { uid: 't1' }, profile: { name: 'Amina' } }}>
      <TenantDashboard />
    </AuthContext.Provider>
  )
}

describe('TenantDashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an empty state when there is no rent yet', () => {
    feed([])
    renderPage()
    expect(screen.getByText(/No rent records yet/)).toBeInTheDocument()
    expect(screen.getByText('No payments yet.')).toBeInTheDocument()
  })

  it('shows the rent status and the demo notice', () => {
    feed([record])
    renderPage()

    expect(screen.getByText(/Welcome, Amina/)).toBeInTheDocument()
    expect(screen.getByText('Partial')).toBeInTheDocument()
    expect(screen.getByText(/Demo payment/)).toBeInTheDocument()
  })

  it('hides the pay form when the rent is fully paid', () => {
    feed([{ ...record, amountPaid: 15000 }])
    renderPage()

    expect(screen.getByText('Paid')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pay rent' })).not.toBeInTheDocument()
  })

  it('shows the payment history', () => {
    feed([record], [
      { id: 'p1', amount: 5000, month: '2026-11', unitName: 'A1', reference: 'SIM123', createdAt: null },
    ])
    renderPage()

    expect(screen.getByText('SIM123')).toBeInTheDocument()
  })

  it('records a payment of the balance', async () => {
    feed([record])
    recordPayment.mockResolvedValue('SIMABC')
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Pay rent' }))

    await waitFor(() => expect(recordPayment).toHaveBeenCalledWith(record, 10000))
    expect(await screen.findByRole('status')).toHaveTextContent('SIMABC')
  })

  it('shows an error when the payment fails', async () => {
    feed([record])
    recordPayment.mockRejectedValue(new Error('fail'))
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Pay rent' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not record the payment')
  })

  it('shows an error when rent cannot be loaded', () => {
    subscribeToTenantRecords.mockImplementation((uid, onData, onError) => {
      onError(new Error('denied'))
      return () => {}
    })
    subscribeToTenantPayments.mockImplementation((uid, onData) => {
      onData([])
      return () => {}
    })
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load your rent')
  })
})
