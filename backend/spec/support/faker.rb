# The app only enables pt-BR (config.i18n.available_locales), so Faker must use pt-BR generators
Faker::Config.locale = "pt-BR"

RSpec.configure do |config|
  config.after { Faker::UniqueGenerator.clear }
end
