import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import PayRentForm from './PayRentForm'

describe('PayRentForm', () => {
  it('starts with the full balance', () => {
    render(<PayRentForm balance={15000} onPay={vi.fn()} />)
    expect(screen.getByLabelText('Amount (KES)')).toHaveValue(15000)
  })

  it('shows an error when the amount is more than the balance', async () => {
    const onPay = vi.fn()
    render(<PayRentForm balance={15000} onPay={onPay} />)

    const input = screen.getByLabelText('Amount (KES)')
    await userEvent.clear(input)
    await userEvent.type(input, '99999')
    await userEvent.click(screen.getByRole('button', { name: 'Pay rent' }))

    expect(screen.getByText(/more than the balance/)).toBeInTheDocument()
    expect(onPay).not.toHaveBeenCalled()
  })

  it('pays the amount as a number', async () => {
    const onPay = vi.fn()
    render(<PayRentForm balance={15000} onPay={onPay} />)

    await userEvent.click(screen.getByRole('button', { name: 'Pay rent' }))

    expect(onPay).toHaveBeenCalledWith(15000)
  })
})
