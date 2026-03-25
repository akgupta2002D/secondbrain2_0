import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the v1 Remember flashcard content', () => {
    render(<App />)

    expect(screen.getByText('What is a Hook?')).toBeInTheDocument()
    expect(screen.getByText('CS-101')).toBeInTheDocument()
    expect(screen.getByText('Hooks')).toBeInTheDocument()

    // The definition is present in the DOM (back face) even before flip.
    expect(
      screen.getByText(
        /A Hook is a function that lets you use React features like state and lifecycle/i,
      ),
    ).toBeInTheDocument()
  })
})

