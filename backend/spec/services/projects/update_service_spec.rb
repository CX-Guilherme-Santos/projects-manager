require "rails_helper"

RSpec.describe Projects::UpdateService do
  let(:project) { create(:project, name: "Projeto Iridium") }

  it "updates the project and returns a successful result" do
    result = described_class.call(project: project, attributes: { name: "Projeto Renomeado" })

    expect(result).to be_success
    expect(project.reload.name).to eq("Projeto Renomeado")
  end

  it "favorites the project" do
    described_class.call(project: project, attributes: { favorite: true })

    expect(project.reload.favorite).to be(true)
  end

  it "returns a failed result and keeps the saved data when the attributes are invalid" do
    result = described_class.call(project: project, attributes: { name: "Curto" })

    expect(result).to be_failure
    expect(result.record.errors[:name]).to be_present
    expect(project.reload.name).to eq("Projeto Iridium")
  end

  context "when the project has a cover" do
    let(:project) { create(:project, :with_cover) }

    it "removes the cover with remove_cover" do
      described_class.call(project: project, attributes: { remove_cover: "true" })

      expect(project.reload.cover).not_to be_attached
    end

    it "keeps the cover when the update fails" do
      described_class.call(project: project, attributes: { name: "Curto", remove_cover: "true" })

      expect(project.reload.cover).to be_attached
    end

    it "replaces the cover when a new one is sent together with remove_cover" do
      new_cover = Rack::Test::UploadedFile.new(file_fixture("cover.jpg"), "image/jpeg")

      described_class.call(project: project, attributes: { cover: new_cover, remove_cover: "true" })

      expect(project.reload.cover).to be_attached
      expect(project.cover.filename.to_s).to eq("cover.jpg")
    end
  end
end
