RSpec.configure do |config|
  # create(:project) instead of FactoryBot.create(:project)
  config.include FactoryBot::Syntax::Methods
end
