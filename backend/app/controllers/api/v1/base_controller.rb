module Api
  module V1
    class BaseController < ApplicationController
      include Pagy::Method

      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActionController::ParameterMissing, with: :bad_request

      private

      def not_found
        render json: { error: "Not found" }, status: :not_found
      end

      def bad_request(exception)
        render json: { error: exception.message }, status: :bad_request
      end

      # Renders a service result: the serialized record on success, field errors otherwise.
      def render_result(result, serializer:, status: :ok)
        if result.success?
          render json: result.record, serializer: serializer, status: status
        else
          unprocessable(result.record)
        end
      end

      # { errors: { name: ["..."], end_date: ["..."] } }, keyed like the form fields
      def unprocessable(record)
        render json: { errors: record.errors.to_hash }, status: :unprocessable_content
      end

      # Paginates with Pagy and sends the pagination in RFC 8288 response headers:
      #   link: <...?page=2>; rel="next", ...   current-page, page-limit, total-count, total-pages
      # The headers are exposed to the browser in config/initializers/cors.rb.
      def paginate(collection)
        pagy, records = pagy(:offset, collection)
        response.headers.merge!(pagy.headers_hash)
        records
      end
    end
  end
end
