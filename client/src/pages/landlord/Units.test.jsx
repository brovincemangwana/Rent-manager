import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Units from './Units'
import { AuthContext } from '../../context/AuthContext'
import { subscribeToProperties } from '../../services/propertyService'
import { addUnit, deleteUnit, subscribeToUnits } from '../../services/unitService'

vi.mock('../../services/propertyService', () => ({
  subscribeToProperties: vi.fn(),
}))
vi.mock('../../services/unitService', () => ({
  subscribeToUnits: vi.fn(),
  addUnit: vi.fn(),
  updateUnit: vi.fn(),
  deleteUnit: vi.fn(),
}))

const property = { id: 'p1', name: 'Sunrise' }
const vacantUnit = {
  id: 'u1',
  name: 'A1',
  propertyName: 'Sunrise',
  monthlyRent: 15000,
  tenantId: '',
  tenantName: '',
}

function feed(properties, units) {
  subscribeToProperties.mockImplementation((uid, onData) => {
    onData(properties)
    return () => {}
  })
  subscribeToUnits.mockImplementation((uid, onData) => {
    onData(units)
    return () => {}
  })
}

function renderPage() {
  render(
    <AuthContext.Provider value={{ user: { uid: 'l1' } }}>
      <MemoryRouter>
        <Units />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

async function fillAndSubmit() {
  await userEvent.selectOptions(screen.getByLabelText('Property'), 'p1')
  await userEvent.type(screen.getByLabelText('Unit name'), 'A1')
  await userEvent.type(screen.getByLabelText('Monthly rent (KES)'), '15000')
  await userEvent.click(screen.getByRole('button', { name: 'Add unit' }))
}

describe('Units page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('asks the landlord to add a property first', () => {
    feed([], [])
    renderPage()
    expect(screen.getByText(/Add a property first/)).toBeInTheDocument()
  })

  it('shows an empty state when there are no units', () => {
    feed([property], [])
    renderPage()
    expect(screen.getByText(/No units yet/)).toBeInTheDocument()
  })

  it('shows a vacant unit', () => {
    feed([property], [vacantUnit])
    renderPage()
    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('Vacant')).toBeInTheDocument()
  })

  it('shows the tenant when a unit is linked', () => {
    feed([property], [{ ...vacantUnit, tenantId: 't1', tenantName: 'Amina' }])
    renderPage()
    expect(screen.getByText('Tenant: Amina')).toBeInTheDocument()
  })

  it('adds a unit', async () => {
    feed([property], [])
    addUnit.mockResolvedValue({})
    renderPage()

    await fillAndSubmit()

    await waitFor(() =>
      expect(addUnit).toHaveBeenCalledWith(
        'l1',
        { propertyId: 'p1', name: 'A1', monthlyRent: '15000', tenantEmail: '' },
        property
      )
    )
  })

  it('explains when the tenant email has no account', async () => {
    feed([property], [])
    addUnit.mockRejectedValue(new Error('TENANT_NOT_FOUND'))
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('No account found with that email')
  })

  it('explains when the email belongs to a landlord', async () => {
    feed([property], [])
    addUnit.mockRejectedValue(new Error('NOT_A_TENANT'))
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('landlord account')
  })

  it('shows a general error when saving fails', async () => {
    feed([property], [])
    addUnit.mockRejectedValue(new Error('other'))
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save the unit')
  })

  it('deletes a unit after confirming', async () => {
    feed([property], [vacantUnit])
    deleteUnit.mockResolvedValue()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteUnit).toHaveBeenCalledWith('u1'))
  })
})
