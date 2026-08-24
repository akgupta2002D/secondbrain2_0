import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from './App'

const auth = vi.hoisted(() => ({
  state: { kind: 'signedIn' as 'booting' | 'signedOut' | 'signedIn' },
}))

vi.mock('./auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./auth')>()
  return {
    ...actual,
    useAuthSession: () => auth.state,
  }
})

describe('App', () => {
  beforeEach(() => {
    auth.state = { kind: 'signedIn' }
  })

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
    expect(screen.getByLabelText(/Card 1 of \d+/)).toBeInTheDocument()

    // The definition is present in the DOM (back face) even before flip.
    expect(
      screen.getByText(
        /computational problem in which each input instance is mapped to a binary outcome/i,
      ),
    ).toBeInTheDocument()

    // Flip the card to reveal the definition state -> review buttons should appear
    fireEvent.click(
      screen.getByRole('button', {
        name: /Flashcard front\. Tap to show back/i,
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

  it('opens Notes from the + control and does not list it under Modules', () => {
    render(<App />)

    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.queryByRole('button', { name: 'Notes' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Engine' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'New note' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Modules' }))

    expect(screen.getByRole('button', { name: 'Modules' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('menuitem', { name: 'Remember' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Thoughts' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Identity' })).toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Notes' })).not.toBeInTheDocument()
    expect(screen.queryByRole('menuitem', { name: 'Engine' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(screen.getByRole('button', { name: 'New note' }))

    expect(
      screen.getByRole('main', { name: /Notes/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('opens Engine from the tab bar', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Engine' }))

    expect(screen.getByRole('button', { name: 'Engine' })).toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('main', { name: 'Engine' })).toBeInTheDocument()
    expect(
      screen.getByText('This will display stats about the server we use.'),
    ).toBeInTheDocument()
  })

  it('returns to the Modules list when the Modules tab is tapped inside a module', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Modules' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Remember' }))

    expect(screen.getByText('Decision Problem')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Modules' }))

    expect(screen.getByRole('main', { name: 'Modules' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Remember' })).toBeInTheDocument()
  })

  it('shows sign-in when signed out and hides Home chrome', () => {
    auth.state = { kind: 'signedOut' }
    render(<App />)

    expect(screen.getByRole('main', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Modules' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Engine' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'New note' })).not.toBeInTheDocument()
  })
})
