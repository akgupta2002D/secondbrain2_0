import { describe, expect, it } from 'vitest'
import { splitNodeLabelLines } from './splitNodeLabelLines'

describe('splitNodeLabelLines', () => {
  it('splits two words', () => {
    expect(splitNodeLabelLines('Family First')).toEqual(['Family', 'First'])
  })

  it('balances three words onto two lines', () => {
    expect(splitNodeLabelLines('One Two Three')).toEqual(['One Two', 'Three'])
  })
})
