import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Register from './Register'
import { registerUser } from '../services/authService'

vi.mock('../services/authService', () => ({
  registerUser: vi.fn(),
  getAuthErrorMessage: vi.fn(() => 'An account with this email already exists.'),
}))

function renderRegister() {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  )
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText('Name'), 'Amina')
  await userEvent.type(screen.getByLabelText('Email'), 'amina@example.com')
  await userEvent.type(screen.getByLabelText('Password'), 'secret123')
  await userEvent.type(screen.getByLabelText('Confirm Password'), 'secret123')
}

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows errors and does not register when the form is empty', async () => {
    renderRegister()

    await userEvent.click(screen.getByRole('button', { name: 'Register' }))

    expect(screen.getByText('Enter your name')).toBeInTheDocument()
    expect(registerUser).not.toHaveBeenCalled()
  })

  it('registers a tenant by default', async () => {
    registerUser.mockResolvedValue({})
    renderRegister()

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Register' }))

    expect(registerUser).toHaveBeenCalledWith({
      name: 'Amina',
      email: 'amina@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
      role: 'tenant',
    })
  })

  it('registers a landlord when that role is chosen', async () => {
    registerUser.mockResolvedValue({})
    renderRegister()

    await fillForm()
    await userEvent.selectOptions(screen.getByLabelText('I am a'), 'landlord')
    await userEvent.click(screen.getByRole('button', { name: 'Register' }))

    expect(registerUser).toHaveBeenCalledWith(expect.objectContaining({ role: 'landlord' }))
  })

  it('shows a message when registration fails', async () => {
    registerUser.mockRejectedValue({ code: 'auth/email-already-in-use' })
    renderRegister()

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Register' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('An account with this email already exists.')
  })
})
