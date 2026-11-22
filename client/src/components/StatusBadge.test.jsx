import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatusBadge from './StatusBadge'

describe('StatusBadge', () => {
  it('shows a text label for overdue', () => {
    render(<StatusBadge status="overdue" />)
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('shows a text label for paid', () => {
    render(<StatusBadge status="paid" />)
    expect(screen.getByText('Paid')).toBeInTheDocument()
  })
})
