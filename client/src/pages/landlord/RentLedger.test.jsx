import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RentLedger from './RentLedger'
import { AuthContext } from '../../context/AuthContext'
import { subscribeToUnits } from '../../services/unitService'
import { generateRentRecords, subscribeToOwnerRecords } from '../../services/rentService'

vi.mock('../../services/unitService', () => ({
  subscribeToUnits: vi.fn(),
}))
vi.mock('../../services/rentService', () => ({
  subscribeToOwnerRecords: vi.fn(),
  generateRentRecords: vi.fn(),
}))

const records = [
  {
    id: 'r1',
    month: '2026-11',
    unitName: 'A1',
    propertyName: 'Sunrise',
    tenantName: 'Amina',
    amountDue: 15000,
    amountPaid: 15000,
  },
  {
    id: 'r2',
    month: '2026-11',
    unitName: 'B2',
    propertyName: 'Sunrise',
    tenantName: 'Peter',
    amountDue: 12000,
    amountPaid: 100,
  },
]

function feed(list) {
  subscribeToUnits.mockImplementation((uid, onData) => {
    onData([])
    return () => {}
  })
  subscribeToOwnerRecords.mockImplementation((uid, onData) => {
    onData(list)
    return () => {}
  })
}

function renderPage() {
  render(
    <AuthContext.Provider value={{ user: { uid: 'l1' } }}>
      <RentLedger />
    </AuthContext.Provider>
  )
}

describe('RentLedger page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an empty state when there are no records', () => {
    feed([])
    renderPage()
    expect(screen.getByText(/No rent records yet/)).toBeInTheDocument()
  })

  it('lists rent records with their status', () => {
    feed(records)
    renderPage()

    const table = screen.getByRole('table')
    expect(within(table).getByText('Amina')).toBeInTheDocument()
    expect(within(table).getByText('Peter')).toBeInTheDocument()
    expect(within(table).getByText('Partial')).toBeInTheDocument()
  })

  it('shows an error when the ledger cannot be loaded', () => {
    subscribeToUnits.mockImplementation((uid, onData) => {
      onData([])
      return () => {}
    })
    subscribeToOwnerRecords.mockImplementation((uid, onData, onError) => {
      onError(new Error('denied'))
      return () => {}
    })
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load the rent ledger')
  })

  it('generates rent and reports how many records were created', async () => {
    feed([])
    generateRentRecords.mockResolvedValue(2)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /^Generate .* rent$/ }))

    expect(await screen.findByRole('status')).toHaveTextContent('Created 2 rent records')
  })

  it('says so when there is nothing new to generate', async () => {
    feed([])
    generateRentRecords.mockResolvedValue(0)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /^Generate .* rent$/ }))

    expect(await screen.findByRole('status')).toHaveTextContent('already up to date')
  })

  it('shows an error when generating fails', async () => {
    feed([])
    generateRentRecords.mockRejectedValue(new Error('fail'))
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /^Generate .* rent$/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not generate rent records')
  })
})
