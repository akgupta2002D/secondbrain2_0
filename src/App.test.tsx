import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows modules and opens Remember flashcards', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    window.localStorage.clear()
    vi.useFakeTimers()

    render(<App />)

    expect(
      screen.getByRole('button', { name: 'Modules' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Modules' }))

    expect(
      screen.getByRole('menuitem', { name: 'Remember' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('menuitem', { name: 'Remember' }))

    expect(screen.getByText('Decision Problem')).toBeInTheDocument()
    expect(screen.getByText('CS-306')).toBeInTheDocument()

    // The definition is present in the DOM (back face) even before flip.
    expect(
      screen.getByText(
        /computational problem in which each input instance is mapped to a binary outcome/i,
      ),
    ).toBeInTheDocument()

    // Flip the card to reveal the definition state -> review buttons should appear
    fireEvent.click(
      screen.getByRole('button', {
        name: /Flashcard front\. Tap to show back\./i,
      }),
    )

    // Score update: swipe right (know) should increase memory score
    fireEvent.pointerDown(
      screen.getByRole('button', {
        name: /Flashcard back\. Tap to show front\./i,
      }),
      { clientX: 100, clientY: 100, pointerId: 1 },
    )
    fireEvent.pointerMove(
      screen.getByRole('button', {
        name: /Flashcard back\. Tap to show front\./i,
      }),
      { clientX: 200, clientY: 100, pointerId: 1 },
    )
    fireEvent.pointerUp(
      screen.getByRole('button', {
        name: /Flashcard back\. Tap to show front\./i,
      }),
      { clientX: 220, clientY: 100, pointerId: 1 },
    )

    // Allow the swipe settle animation timeout to complete.
    vi.advanceTimersByTime(200)

    // Open topic modal and verify updated score
    fireEvent.click(screen.getByRole('button', { name: 'Topics' }))

    expect(screen.getByText('60')).toBeInTheDocument()

    vi.useRealTimers()
  })
})

