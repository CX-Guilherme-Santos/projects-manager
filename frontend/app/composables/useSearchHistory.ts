const MAX_TERMS = 5

const normalize = (term: string) => term.trim().toLowerCase()

// Last searches, saved in this browser only (localStorage).
// The search runs while the user types, so "Pro" → "Proj" → "Projet" would fill the
// history with fragments: a term that extends (or shortens) the latest one replaces it.
export function useSearchHistory() {
  // flush 'sync': written right away, so a search followed by navigation is never lost.
  // VueUse already guards against unavailable storage (private mode, blocked cookies).
  const terms = useLocalStorage<string[]>('projects-manager:search-history', [], { flush: 'sync' })

  function record(rawTerm: string) {
    const term = rawTerm.trim()
    if (!isSearchable(term)) return
    const key = normalize(term)
    const [latest, ...older] = terms.value
    const latestKey = latest === undefined ? undefined : normalize(latest)
    const isRefinement = latestKey !== undefined && (key.startsWith(latestKey) || latestKey.startsWith(key))

    const rest = (isRefinement ? older : terms.value).filter(saved => normalize(saved) !== key)
    terms.value = [term, ...rest].slice(0, MAX_TERMS)
  }

  function remove(term: string) {
    terms.value = terms.value.filter(saved => saved !== term)
  }

  return { terms, record, remove }
}
