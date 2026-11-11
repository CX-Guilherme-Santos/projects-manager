module RequestHelpers
  def json = response.parsed_body
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end
