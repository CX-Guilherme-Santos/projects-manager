RSpec.configure do |config|
  # travel_to(Date.new(2026, 11, 10)) { ... } for date-dependent rules
  config.include ActiveSupport::Testing::TimeHelpers
end
