import { describe, expect, it } from 'vitest'
import { splitHighlight } from '../../app/utils/highlight'

describe('splitHighlight', () => {
  it('marks the matched part ignoring case, keeping the original text', () => {
    expect(splitHighlight('Projeto 01', 'PROJET')).toEqual([
      { text: 'Projet', match: true },
      { text: 'o 01', match: false },
    ])
  })
})
