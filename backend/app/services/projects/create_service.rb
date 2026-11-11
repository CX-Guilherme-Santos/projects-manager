module Projects
  class CreateService < ApplicationService
    # `remove_cover` only makes sense when editing, so it is ignored here
    def initialize(attributes:)
      @attributes = attributes.except(:remove_cover)
    end

    def call
      project = Project.new(@attributes)

      project.save ? success(project) : failure(project)
    end
  end
end
