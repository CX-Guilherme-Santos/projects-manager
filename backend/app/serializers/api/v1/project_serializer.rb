module Api
  module V1
    # Part of the v1 API contract (the response shape). Business rules live in the model and services,
    # which are not versioned.
    class ProjectSerializer < ActiveModel::Serializer
      attributes :id, :name, :client, :start_date, :end_date, :favorite, :cover_url, :created_at, :updated_at

      def cover_url
        object.cover.url if object.cover.attached?
      end
    end
  end
end
