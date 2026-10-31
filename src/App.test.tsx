import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { ThemeProvider } from './theme/ThemeContext'

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryClientProvider>,
  )
}

describe('starter', () => {
  it('reaches the mock API', async () => {
    renderApp()

    const status = screen.getByRole('status')
    await waitFor(
      () => expect(status).toHaveTextContent('Mock API: connected'),
      { timeout: 3000 },
    )
  })
})
