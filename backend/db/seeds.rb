# Sample projects for local development: `bin/rails db:seed` (idempotent).
# Enough rows for two pages, so the infinite scroll can be tried.
return unless Rails.env.development?

clients = [ "Clicksign", "Acme", "Iridium Corp", "Xenon Labs" ]

12.times do |i|
  number = format("%02d", i + 1)
  start_date = Date.new(2026, 1, 1) + (i * 21).days

  project = Project.find_or_create_by!(name: "Projeto #{number}") do |p|
    p.client = clients[i % clients.size]
    p.start_date = start_date
    p.end_date = start_date + (60 + (i * 17)).days
    p.favorite = [ 0, 6 ].include?(i)
  end

  next if i.positive? || project.cover.attached?

  project.cover.attach(
    io: Rails.root.join("spec/fixtures/files/cover.jpg").open,
    filename: "cover.jpg",
    content_type: "image/jpeg"
  )
end
