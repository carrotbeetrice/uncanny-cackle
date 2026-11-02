import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { SegmentProvider, type Segment } from '../../../theme/SegmentContext'
import SegmentSwitch from './SegmentSwitch'

// Spec tests for brief TH2 (segment) and TH3 (accessible toggles). The
// contract is:
// - `<SegmentSwitch />` takes no props and reads the segment from
//   SegmentProvider (saved choice ?? customer's `defaultSegment` ?? retail)
// - `Retail` / `Premium` buttons with `aria-pressed`
// - the segment is set on <html> as `data-segment`
// - the choice is saved to localStorage under `meridian-segment`

const html = document.documentElement

function renderSwitch(defaultSegment: Segment = 'retail') {
  return render(
    <SegmentProvider defaultSegment={defaultSegment}>
      <SegmentSwitch />
    </SegmentProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  html.setAttribute('data-theme', 'light')
  html.setAttribute('data-segment', 'retail')
})

describe('SegmentSwitch (TH2, TH3)', () => {
  it("defaults to the customer's segment", () => {
    renderSwitch('premium')

    expect(html).toHaveAttribute('data-segment', 'premium')
    expect(screen.getByRole('button', { name: 'Premium' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Retail' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('switches the segment on <html> without changing the theme', async () => {
    const user = userEvent.setup()
    html.setAttribute('data-theme', 'dark')
    renderSwitch()

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
    renderSwitch()

    await user.click(screen.getByRole('button', { name: 'Premium' }))

    expect(localStorage.getItem('meridian-segment')).toBe('premium')
  })

  it("prefers a saved segment over the customer's default", () => {
    localStorage.setItem('meridian-segment', 'premium')
    renderSwitch('retail')

    expect(html).toHaveAttribute('data-segment', 'premium')
    expect(screen.getByRole('button', { name: 'Premium' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
