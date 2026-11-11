# This file is copied to spec/ when you run 'rails generate rspec:install'
require "spec_helper"
ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?
require "rspec/rails"

# Shared configuration and helpers (FactoryBot, shoulda-matchers, request helpers)
Rails.root.glob("spec/support/**/*.rb").sort.each { |file| require file }

# Checks for pending migrations and applies them before tests are run.
begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

RSpec.configure do |config|
  config.fixture_paths = [ Rails.root.join("spec/fixtures") ]

  # Each example runs inside a transaction that is rolled back at the end
  config.use_transactional_fixtures = true

  # spec/models -> type: :model, spec/requests -> type: :request, ...
  config.infer_spec_type_from_file_location!

  config.filter_rails_from_backtrace!
end
