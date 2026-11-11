module Projects
  class DestroyService < ApplicationService
    # Permanent removal, as the confirmation modal states. The cover file is purged by
    # Active Storage (has_one_attached defaults to dependent: :purge_later).
    def initialize(project:)
      @project = project
    end

    def call
      @project.destroy ? success(@project) : failure(@project)
    end
  end
end
