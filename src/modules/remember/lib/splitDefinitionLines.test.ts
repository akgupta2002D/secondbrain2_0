import { describe, expect, it } from 'vitest'
import { splitDefinitionForDisplay } from './splitDefinitionLines'

describe('splitDefinitionForDisplay', () => {
  it('returns single line when no sentence boundary', () => {
    expect(splitDefinitionForDisplay('Hello world')).toEqual(['Hello world'])
  })

  it('splits on period followed by space', () => {
    expect(splitDefinitionForDisplay('First. Second here.')).toEqual([
      'First.',
      'Second here.',
    ])
  })

  it('trims outer whitespace', () => {
    expect(splitDefinitionForDisplay('  A. B  ')).toEqual(['A.', 'B'])
  })
})
