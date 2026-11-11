FactoryBot.define do
  factory :project do
    # Always two or more words, as the model requires
    name { "Projeto #{Faker::Name.unique.first_name}" }
    client { Faker::Company.name }
    start_date { Date.new(2026, 9, 1) }
    end_date { Date.new(2026, 12, 12) }
    favorite { false }

    trait :favorite do
      favorite { true }
    end

    trait :with_cover do
      after(:build) do |project|
        project.cover.attach(
          io: Rails.root.join("spec/fixtures/files/cover.png").open,
          filename: "cover.png",
          content_type: "image/png"
        )
      end
    end
  end
end
