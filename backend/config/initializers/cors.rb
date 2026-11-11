# Be sure to restart your server when you modify this file.

# Allows the Nuxt frontend to call this API from another origin.
# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("FRONTEND_ORIGIN", "http://localhost:3001")

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ],
      # Pagination headers set by Pagy (BaseController#paginate). Browsers hide non-safelisted
      # response headers from cross-origin JavaScript unless they are exposed here.
      expose: %w[link current-page page-limit total-count total-pages]
  end
end
