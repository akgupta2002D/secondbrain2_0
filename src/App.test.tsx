import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows modules and opens Remember flashcards', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.1)
    window.localStorage.clear()

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

    // The definition is present in the DOM (back face) even before flip.
    expect(
      screen.getByText(
        /A Hook is a function that lets you use React features like state and lifecycle/i,
      ),
    ).toBeInTheDocument()

    // Flip the card to reveal the definition state -> review buttons should appear
    fireEvent.click(
      screen.getByRole('button', {
        name: /Flashcard front\. Tap to show back\./i,
      }),
    )

    expect(screen.getByRole('button', { name: 'Correct' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Incorrect' }),
    ).toBeInTheDocument()

    // Score update: correct should increase topic memory score
    fireEvent.click(screen.getByRole('button', { name: 'Correct' }))

    // Open topic modal and verify updated score
    fireEvent.click(screen.getByRole('button', { name: 'Topics' }))

    expect(screen.getByText('60')).toBeInTheDocument()
  })
})

