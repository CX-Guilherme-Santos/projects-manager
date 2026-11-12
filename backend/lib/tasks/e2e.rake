# Used by the Playwright suite (e2e/) before each test. Runs only against the test
# database, so the API never exposes a "reset" endpoint.
namespace :e2e do
  desc "Empty the test database (projects and their covers)"
  task reset: :environment do
    abort "e2e:reset only runs with RAILS_ENV=test" unless Rails.env.test?

    ActiveRecord::Base.connection.truncate_tables(
      "projects", "active_storage_variant_records", "active_storage_attachments", "active_storage_blobs"
    )
  end
end
