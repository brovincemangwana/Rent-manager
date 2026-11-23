import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Properties from './Properties'
import { AuthContext } from '../../context/AuthContext'
import {
  addProperty,
  deleteProperty,
  subscribeToProperties,
  updateProperty,
} from '../../services/propertyService'

vi.mock('../../services/propertyService', () => ({
  subscribeToProperties: vi.fn(),
  addProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
}))

const sunrise = { id: 'p1', name: 'Sunrise', address: 'Kilimani' }

function feed(list) {
  subscribeToProperties.mockImplementation((uid, onData) => {
    onData(list)
    return () => {}
  })
}

function renderPage() {
  render(
    <AuthContext.Provider value={{ user: { uid: 'l1' } }}>
      <Properties />
    </AuthContext.Provider>
  )
}

describe('Properties page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows an empty state when there are no properties', () => {
    feed([])
    renderPage()
    expect(screen.getByText(/No properties yet/)).toBeInTheDocument()
  })

  it('lists the landlord properties', () => {
    feed([sunrise])
    renderPage()
    expect(screen.getByText('Sunrise')).toBeInTheDocument()
    expect(screen.getByText('Kilimani')).toBeInTheDocument()
  })

  it('shows an error when properties cannot be loaded', () => {
    subscribeToProperties.mockImplementation((uid, onData, onError) => {
      onError(new Error('denied'))
      return () => {}
    })
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load your properties')
  })

  it('adds a property', async () => {
    feed([])
    addProperty.mockResolvedValue({})
    renderPage()

    await userEvent.type(screen.getByLabelText('Property name'), 'Sunrise')
    await userEvent.type(screen.getByLabelText('Address'), 'Kilimani')
    await userEvent.click(screen.getByRole('button', { name: 'Add property' }))

    await waitFor(() =>
      expect(addProperty).toHaveBeenCalledWith('l1', { name: 'Sunrise', address: 'Kilimani' })
    )
  })

  it('shows an error when saving fails', async () => {
    feed([])
    addProperty.mockRejectedValue(new Error('fail'))
    renderPage()

    await userEvent.type(screen.getByLabelText('Property name'), 'Sunrise')
    await userEvent.type(screen.getByLabelText('Address'), 'Kilimani')
    await userEvent.click(screen.getByRole('button', { name: 'Add property' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save the property')
  })

  it('edits a property', async () => {
    feed([sunrise])
    updateProperty.mockResolvedValue()
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const name = screen.getByLabelText('Property name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Moonrise')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() =>
      expect(updateProperty).toHaveBeenCalledWith('p1', { name: 'Moonrise', address: 'Kilimani' })
    )
  })

  it('deletes a property after confirming', async () => {
    feed([sunrise])
    deleteProperty.mockResolvedValue()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteProperty).toHaveBeenCalledWith('p1'))
  })

  it('does not delete when the landlord cancels', async () => {
    feed([sunrise])
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteProperty).not.toHaveBeenCalled()
  })
})
