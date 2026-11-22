import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from './Login'
import { loginUser, loginWithGoogle } from '../services/authService'

vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  loginWithGoogle: vi.fn(),
  getAuthErrorMessage: vi.fn(() => 'Incorrect email or password.'),
}))

function renderLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  )
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText('Email'), 'amina@example.com')
  await userEvent.type(screen.getByLabelText('Password'), 'secret123')
}

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows errors and does not log in when the form is empty', async () => {
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Enter your password')).toBeInTheDocument()
    expect(loginUser).not.toHaveBeenCalled()
  })

  it('logs in with the entered details', async () => {
    loginUser.mockResolvedValue({})
    renderLogin()

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(loginUser).toHaveBeenCalledWith({ email: 'amina@example.com', password: 'secret123' })
  })

  it('shows a message when login fails', async () => {
    loginUser.mockRejectedValue({ code: 'auth/invalid-credential' })
    renderLogin()

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')
  })

  it('signs in with Google', async () => {
    loginWithGoogle.mockResolvedValue({})
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(loginWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('shows a message when Google sign-in fails', async () => {
    loginWithGoogle.mockRejectedValue({ code: 'auth/popup-closed-by-user' })
    renderLogin()

    await userEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
