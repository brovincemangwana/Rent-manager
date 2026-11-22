import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import RequestForm from './RequestForm'

const units = [
  { id: 'u1', name: 'A1', propertyName: 'Sunrise' },
  { id: 'u2', name: 'B2', propertyName: 'Sunrise' },
]

describe('RequestForm', () => {
  it('shows errors and does not submit when empty', async () => {
    const onSubmit = vi.fn()
    render(<RequestForm units={units} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Send request' }))

    expect(screen.getByText('Select the unit this is about')).toBeInTheDocument()
    expect(screen.getByText('Enter a short title')).toBeInTheDocument()
    expect(screen.getByText('Describe the problem')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the values when valid', async () => {
    const onSubmit = vi.fn()
    render(<RequestForm units={units} onSubmit={onSubmit} />)

    await userEvent.selectOptions(screen.getByLabelText('Unit'), 'u1')
    await userEvent.type(screen.getByLabelText('Title'), 'Leaking tap')
    await userEvent.type(screen.getByLabelText('Description'), 'Kitchen tap drips')
    await userEvent.click(screen.getByRole('button', { name: 'Send request' }))

    expect(onSubmit).toHaveBeenCalledWith({
      unitId: 'u1',
      title: 'Leaking tap',
      description: 'Kitchen tap drips',
    })
  })

  it('preselects the unit when the tenant has only one', () => {
    render(<RequestForm units={[units[0]]} onSubmit={vi.fn()} />)
    expect(screen.getByLabelText('Unit')).toHaveValue('u1')
  })
})
