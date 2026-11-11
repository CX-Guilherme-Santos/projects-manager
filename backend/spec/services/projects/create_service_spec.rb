require "rails_helper"

RSpec.describe Projects::CreateService do
  let(:attributes) do
    { name: "Projeto Iridium", client: "Clicksign", start_date: "2026-09-01", end_date: "2026-12-12" }
  end

  it "creates the project and returns a successful result" do
    result = nil

    expect { result = described_class.call(attributes: attributes) }.to change(Project, :count).by(1)

    expect(result).to be_success
    expect(result.record).to be_persisted.and have_attributes(name: "Projeto Iridium", client: "Clicksign")
  end

  it "returns a failed result with the errors when the attributes are invalid" do
    result = described_class.call(attributes: attributes.merge(name: "Iridium"))

    expect(result).to be_failure
    expect(result.record).not_to be_persisted
    expect(result.record.errors[:name]).to eq([ "Por favor, digite ao menos duas palavras" ])
  end

  it "ignores remove_cover" do
    result = described_class.call(attributes: attributes.merge(remove_cover: "true"))

    expect(result).to be_success
  end
end
