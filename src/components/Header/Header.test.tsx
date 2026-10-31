import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Customer } from '../../api/types'
import Header from './Header'

// Spec tests for brief D2 (header) and TH1–TH3 (themes). Written ahead of the
// implementation. The planned contract is:
// - `<Header customer={customer} />`, where `customer` is undefined while loading
// - theme and segment are set on <html> as `data-theme` / `data-segment`
// - choices are saved to localStorage under `meridian-theme` / `meridian-segment`

const ava: Customer = {
  id: 'cus_001',
  firstName: 'Ava',
  lastName: 'Chen',
  email: 'ava.chen@example.com',
  segment: 'retail',
  dailyTransferLimit: 5000,
  transferredToday: 0,
}

const html = document.documentElement

beforeEach(() => {
  localStorage.clear()
  html.setAttribute('data-theme', 'light')
  html.setAttribute('data-segment', 'retail')
})

describe('Header', () => {
  describe('content (D2)', () => {
    it('shows the Meridian logo', () => {
      render(<Header customer={ava} />)

      expect(screen.getByText('Meridian')).toBeInTheDocument()
    })

    it('greets the customer by first name', () => {
      render(<Header customer={ava} />)

      expect(screen.getByText('Good evening, Ava')).toBeInTheDocument()
    })

    it("shows the customer's initials as the avatar", () => {
      render(<Header customer={ava} />)

      expect(screen.getByText('AC')).toBeInTheDocument()
    })

    it('does not show a greeting while the customer is loading', () => {
      render(<Header customer={undefined} />)

      expect(screen.queryByText(/good evening/i)).not.toBeInTheDocument()
    })

    it('shows Cards, Payments and Insights as disabled', () => {
      render(<Header customer={ava} />)

      for (const name of ['Cards', 'Payments', 'Insights']) {
        expect(screen.getByText(name)).toHaveAttribute('aria-disabled', 'true')
      }
    })
  })

  describe('light/dark toggle (TH1, TH3)', () => {
    it('has an accessible label and reflects the current theme', () => {
      render(<Header customer={ava} />)

      const toggle = screen.getByRole('button', { name: /dark mode/i })
      expect(toggle).toHaveAttribute('aria-pressed', 'false')
    })

    it('switches the theme on <html> and back again', async () => {
      const user = userEvent.setup()
      render(<Header customer={ava} />)
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
      render(<Header customer={ava} />)

      await user.click(screen.getByRole('button', { name: /dark mode/i }))

      expect(localStorage.getItem('meridian-theme')).toBe('dark')
    })

    it('starts from the theme already applied before first paint', () => {
      html.setAttribute('data-theme', 'dark')
      render(<Header customer={ava} />)

      expect(screen.getByRole('button', { name: /dark mode/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })

    it('can be toggled with the keyboard', async () => {
      const user = userEvent.setup()
      render(<Header customer={ava} />)
      const toggle = screen.getByRole('button', { name: /dark mode/i })

      toggle.focus()
      await user.keyboard('{Enter}')

      expect(html).toHaveAttribute('data-theme', 'dark')
    })
  })

  describe('Retail/Premium switch (TH2, TH3)', () => {
    it("defaults to the customer's segment", () => {
      render(<Header customer={ava} />)

      expect(screen.getByRole('button', { name: 'Retail' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByRole('button', { name: 'Premium' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })

    it('switches the segment on <html> without changing the theme', async () => {
      const user = userEvent.setup()
      html.setAttribute('data-theme', 'dark')
      render(<Header customer={ava} />)

      await user.click(screen.getByRole('button', { name: 'Premium' }))

      expect(html).toHaveAttribute('data-segment', 'premium')
      expect(html).toHaveAttribute('data-theme', 'dark')
      expect(screen.getByRole('button', { name: 'Premium' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(screen.getByRole('button', { name: 'Retail' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })

    it('remembers the choice in localStorage', async () => {
      const user = userEvent.setup()
      render(<Header customer={ava} />)

      await user.click(screen.getByRole('button', { name: 'Premium' }))

      expect(localStorage.getItem('meridian-segment')).toBe('premium')
    })

    it("prefers a saved segment over the customer's default", () => {
      localStorage.setItem('meridian-segment', 'premium')
      render(<Header customer={ava} />)

      expect(html).toHaveAttribute('data-segment', 'premium')
      expect(screen.getByRole('button', { name: 'Premium' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })
  })
})
