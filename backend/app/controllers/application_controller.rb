class ApplicationController < ActionController::API
  # Lets Active Storage build absolute URLs (Disk service locally, signed R2 URLs in production)
  include ActiveStorage::SetCurrent
end
