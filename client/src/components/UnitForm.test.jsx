import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import UnitForm from './UnitForm'

const properties = [{ id: 'p1', name: 'Sunrise' }]

describe('UnitForm', () => {
  it('shows errors and does not submit when empty', async () => {
    const onSubmit = vi.fn()
    render(<UnitForm properties={properties} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Add unit' }))

    expect(screen.getByText('Select a property for this unit')).toBeInTheDocument()
    expect(screen.getByText('Enter a unit name')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the values when valid', async () => {
    const onSubmit = vi.fn()
    render(<UnitForm properties={properties} onSubmit={onSubmit} />)

    await userEvent.selectOptions(screen.getByLabelText('Property'), 'p1')
    await userEvent.type(screen.getByLabelText('Unit name'), 'A1')
    await userEvent.type(screen.getByLabelText('Monthly rent (KES)'), '15000')
    await userEvent.click(screen.getByRole('button', { name: 'Add unit' }))

    expect(onSubmit).toHaveBeenCalledWith({
      propertyId: 'p1',
      name: 'A1',
      monthlyRent: '15000',
      tenantEmail: '',
    })
  })
})
