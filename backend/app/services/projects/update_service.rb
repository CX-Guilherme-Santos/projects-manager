module Projects
  class UpdateService < ApplicationService
    # Also used to favorite/unfavorite: attributes: { favorite: true }.
    # `remove_cover: true` (without a new `cover`) deletes the current cover.
    def initialize(project:, attributes:)
      @project = project
      @remove_cover = ActiveModel::Type::Boolean.new.cast(attributes[:remove_cover])
      @attributes = attributes.except(:remove_cover)
    end

    def call
      return failure(@project) unless @project.update(@attributes)

      # Only after a successful update, so a rejected edit never loses the current cover
      @project.cover.purge_later if remove_cover?

      success(@project)
    end

    private

    def remove_cover?
      @remove_cover && !@attributes.key?(:cover) && @project.cover.attached?
    end
  end
end
