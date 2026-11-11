# The :attributes adapter renders resources without a root key: a single project is a plain
# object and the list is a plain array. Pagination and counts travel in response headers
# (see Api::V1::BaseController#paginate). Keys stay snake_case, like the params.
ActiveModelSerializers.config.adapter = :attributes
