import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeProvider } from '../../theme/ThemeContext'
import ThemeToggle from './ThemeToggle'

// Spec tests for brief TH1 (light/dark) and TH3 (accessible toggles). The
// contract is:
// - `<ThemeToggle />` takes no props and reads the theme from ThemeProvider,
//   which starts from the theme already on <html>
// - the theme is set on <html> as `data-theme`
// - the choice is saved to localStorage under `meridian-theme`

const html = document.documentElement

beforeEach(() => {
  localStorage.clear()
  html.setAttribute('data-theme', 'light')
})

describe('ThemeToggle (TH1, TH3)', () => {
  it('has an accessible label and reflects the current theme', () => {
    render(<ThemeToggle />, { wrapper: ThemeProvider })

    const toggle = screen.getByRole('button', { name: /dark mode/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches the theme on <html> and back again', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />, { wrapper: ThemeProvider })
    const toggle = screen.getByRole('button', { name: /dark mode/i })

    await user.click(toggle)
    expect(html).toHaveAttribute('data-theme', 'dark')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')

    await user.click(toggle)
    expect(html).toHaveAttribute('data-theme', 'light')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('remembers the choice in localStorage', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />, { wrapper: ThemeProvider })

    await user.click(screen.getByRole('button', { name: /dark mode/i }))

    expect(localStorage.getItem('meridian-theme')).toBe('dark')
  })

  it('starts from the theme already applied before first paint', () => {
    html.setAttribute('data-theme', 'dark')
    render(<ThemeToggle />, { wrapper: ThemeProvider })

    expect(screen.getByRole('button', { name: /dark mode/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('can be toggled with the keyboard', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />, { wrapper: ThemeProvider })
    const toggle = screen.getByRole('button', { name: /dark mode/i })

    toggle.focus()
    await user.keyboard('{Enter}')

    expect(html).toHaveAttribute('data-theme', 'dark')
  })
})
