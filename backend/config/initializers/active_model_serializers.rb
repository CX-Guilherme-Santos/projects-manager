# The :json adapter wraps responses in a root key ({ "project": ... } / { "projects": [...] })
# and supports a top-level `meta`, used for pagination. Keys stay snake_case, like the params.
ActiveModelSerializers.config.adapter = :json
