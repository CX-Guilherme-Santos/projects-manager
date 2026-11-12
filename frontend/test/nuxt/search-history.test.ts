import { beforeEach, describe, expect, it } from 'vitest'

beforeEach(() => localStorage.clear())

describe('useSearchHistory', () => {
  it('keeps the last five searches, most recent first', () => {
    const history = useSearchHistory()

    for (const term of ['Alfa', 'Beta', 'Gama', 'Delta', 'Épsilon', 'Zeta']) history.record(term)

    expect(history.terms.value).toEqual(['Zeta', 'Épsilon', 'Delta', 'Gama', 'Beta'])
  })

  it('keeps only the final term while the user is still typing (or erasing) it', () => {
    const history = useSearchHistory()

    for (const term of ['Xenon', 'Pro', 'Proj', 'Projet', 'Proje']) history.record(term)

    expect(history.terms.value).toEqual(['Proje', 'Xenon'])
  })

  it('moves a repeated search to the top, ignoring case and spaces', () => {
    const history = useSearchHistory()

    for (const term of ['Iridium', 'Xenon', ' iridium ']) history.record(term)

    expect(history.terms.value).toEqual(['iridium', 'Xenon'])
  })

  it('ignores terms too short to search', () => {
    const history = useSearchHistory()

    history.record('Pr ')

    expect(history.terms.value).toEqual([])
  })

  it('removes a single search', () => {
    const history = useSearchHistory()
    for (const term of ['Iridium', 'Xenon']) history.record(term)

    history.remove('Iridium')

    expect(history.terms.value).toEqual(['Xenon'])
  })

  it('survives a reload', () => {
    useSearchHistory().record('Iridium')

    expect(JSON.parse(localStorage.getItem('projects-manager:search-history')!)).toEqual(['Iridium'])
  })
})
