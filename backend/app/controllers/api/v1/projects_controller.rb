module Api
  module V1
    class ProjectsController < BaseController
      # GET /api/v1/projects?favorite=true&q=iri&sort=nearest_end&page=2
      has_scope :favorites, as: :favorite, type: :boolean, only: :index
      has_scope :search, as: :q, only: :index
      has_scope :sorted_by, as: :sort, default: Project::DEFAULT_SORT, only: :index

      before_action :set_project, only: %i[show update destroy]

      # The body is a plain array; pagination and counts go in the response headers
      # (see BaseController#paginate).
      def index
        projects = paginate(apply_scopes(Project.with_attached_cover))

        render json: projects, each_serializer: Api::V1::ProjectSerializer
      end

      def show
        render json: @project, serializer: Api::V1::ProjectSerializer
      end

      def create
        result = Projects::CreateService.call(attributes: project_params)

        render_result(result, serializer: Api::V1::ProjectSerializer, status: :created)
      end

      def update
        result = Projects::UpdateService.call(project: @project, attributes: project_params)

        render_result(result, serializer: Api::V1::ProjectSerializer)
      end

      def destroy
        result = Projects::DestroyService.call(project: @project)

        result.success? ? head(:no_content) : unprocessable(result.record)
      end

      private

      def set_project
        @project = Project.find(params[:id])
      end

      def project_params
        params.expect(project: %i[name client start_date end_date favorite cover remove_cover]).to_h
      end
    end
  end
end
