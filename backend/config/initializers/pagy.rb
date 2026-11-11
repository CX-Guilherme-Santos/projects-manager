# Pagy 43 defaults for the JSON API (see https://ddnexus.github.io/pagy).
# Clients may ask for a different page size with `?limit=`, capped at `client_limit`.
Pagy::OPTIONS[:limit] = 10
Pagy::OPTIONS[:client_limit] = 50
Pagy::OPTIONS.freeze
