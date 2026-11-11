// Same minimum as Project::MIN_SEARCH_LENGTH in the API
export const MIN_SEARCH_LENGTH = 3

export const isSearchable = (term: string) => term.trim().length >= MIN_SEARCH_LENGTH
