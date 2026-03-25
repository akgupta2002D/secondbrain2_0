import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('shows modules and opens Remember flashcards', () => {
    render(<App />)

    expect(
      screen.getByRole('button', { name: 'Modules' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Modules' }))

    expect(
      screen.getByRole('menuitem', { name: 'Remember' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Remember' }))

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

