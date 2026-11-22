import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PropertyForm from './PropertyForm'

describe('PropertyForm', () => {
  it('shows errors and does not submit when empty', async () => {
    const onSubmit = vi.fn()
    render(<PropertyForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Add property' }))

    expect(screen.getByText('Enter a property name')).toBeInTheDocument()
    expect(screen.getByText('Enter the property address')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the values when valid', async () => {
    const onSubmit = vi.fn()
    render(<PropertyForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Property name'), 'Sunrise')
    await userEvent.type(screen.getByLabelText('Address'), 'Kilimani')
    await userEvent.click(screen.getByRole('button', { name: 'Add property' }))

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Sunrise', address: 'Kilimani' })
  })

  it('fills in the existing values when editing', () => {
    render(<PropertyForm initial={{ name: 'Sunrise', address: 'Kilimani' }} onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('Property name')).toHaveValue('Sunrise')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })
})
