require "rails_helper"

RSpec.describe Projects::DestroyService do
  it "deletes the project and returns a successful result" do
    project = create(:project)
    result = nil

    expect { result = described_class.call(project: project) }.to change(Project, :count).by(-1)

    expect(result).to be_success
    expect(result.record).to be_destroyed
  end

  it "removes the cover attachment together with the project" do
    project = create(:project, :with_cover)

    expect { described_class.call(project: project) }.to change(ActiveStorage::Attachment, :count).by(-1)
  end
end
