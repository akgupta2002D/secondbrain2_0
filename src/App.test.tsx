import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the v1 text content', () => {
    render(<App />)

    expect(screen.getByText('App installed')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Hey Ankit' })).toBeInTheDocument()
  })
})

