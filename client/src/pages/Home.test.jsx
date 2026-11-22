import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Home from './Home'

describe('Home', () => {
  it('shows the app name', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: 'Rent Manager' })).toBeInTheDocument()
  })
})
