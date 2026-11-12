require "rails_helper"

RSpec.describe "Api::V1::Projects" do
  let(:valid_attributes) do
    { name: "Projeto Iridium", client: "Clicksign", start_date: "2026-09-01", end_date: "2026-12-12" }
  end

  describe "GET /api/v1/projects" do
    context "without projects" do
      it "returns an empty list with zeroed totals" do
        get api_v1_projects_path

        expect(response).to have_http_status(:ok)
        expect(json).to eq([])
        expect(response.headers["total-count"]).to eq("0")
        expect(response.headers["link"]).not_to include('rel="next"')
      end
    end

    it "serializes each project" do
      project = create(:project, :favorite, name: "Projeto Iridium", client: "Clicksign")

      get api_v1_projects_path

      expect(json.first.except("created_at", "updated_at")).to eq(
        "id" => project.id, "name" => "Projeto Iridium", "client" => "Clicksign",
        "start_date" => "2026-09-01", "end_date" => "2026-12-12", "favorite" => true, "cover_url" => nil
      )
    end

    describe "sorting" do
      before do
        create(:project, name: "Projeto antigo", start_date: Date.new(2026, 1, 1), end_date: Date.new(2027, 1, 1))
        create(:project, name: "Projeto novo", start_date: Date.new(2026, 6, 1), end_date: Date.new(2026, 12, 1))
      end

      it "sorts alphabetically by default" do
        get api_v1_projects_path

        expect(json.pluck("name")).to eq([ "Projeto antigo", "Projeto novo" ])
      end

      it "sorts by the most recent start date with sort=recent_start" do
        get api_v1_projects_path, params: { sort: "recent_start" }

        expect(json.pluck("name")).to eq([ "Projeto novo", "Projeto antigo" ])
      end

      it "sorts by the closest end date with sort=nearest_end" do
        travel_to Date.new(2026, 11, 10) do
          get api_v1_projects_path, params: { sort: "nearest_end" }
        end

        expect(json.pluck("name")).to eq([ "Projeto novo", "Projeto antigo" ])
      end
    end

    describe "favorites filter" do
      before do
        create(:project, :favorite, name: "Projeto favorito")
        create(:project, name: "Projeto comum")
      end

      it "returns only favorites with favorite=true" do
        get api_v1_projects_path, params: { favorite: "true" }

        expect(json.pluck("name")).to eq([ "Projeto favorito" ])
      end

      it "returns every project with favorite=false" do
        get api_v1_projects_path, params: { favorite: "false" }

        expect(json.size).to eq(2)
      end

      it "counts only the filtered projects in total-count" do
        get api_v1_projects_path, params: { favorite: "true" }

        expect(response.headers["total-count"]).to eq("1")
      end
    end

    describe "search" do
      # Fixed client: the search also matches the client, and a random Faker company could contain "iri"
      before do
        create(:project, :favorite, name: "Projeto Iridium", client: "Acme")
        create(:project, name: "Iridium antigo", client: "Acme")
        create(:project, :favorite, name: "Projeto Xenon", client: "Acme")
      end

      it "combines q with the other filters" do
        get api_v1_projects_path, params: { q: "iri", favorite: "true" }

        expect(json.pluck("name")).to eq([ "Projeto Iridium" ])
      end

      it "ignores terms shorter than three characters" do
        get api_v1_projects_path, params: { q: "ir" }

        expect(json.size).to eq(3)
      end
    end

    describe "pagination" do
      before do
        11.times { |i| create(:project, name: "Projeto #{format('%02d', i)}") }
      end

      it "returns 10 projects per page and the pagination in the headers" do
        get api_v1_projects_path

        expect(json.size).to eq(10)
        expect(response.headers.to_h).to include(
          "current-page" => "1", "page-limit" => "10", "total-count" => "11", "total-pages" => "2"
        )
        expect(response.headers["link"]).to match(/<[^>]*page=2[^>]*>; rel="next"/)
      end

      it "keeps the filters in the next page link" do
        get api_v1_projects_path, params: { sort: "recent_start", limit: 5 }

        expect(response.headers["link"]).to match(/<[^>]*sort=recent_start[^>]*page=2[^>]*>; rel="next"/)
      end

      it "returns the last page without a next link" do
        get api_v1_projects_path, params: { page: 2 }

        expect(json.pluck("name")).to eq([ "Projeto 10" ])
        expect(response.headers["link"]).not_to include('rel="next"')
      end

      it "caps the page size requested by the client" do
        get api_v1_projects_path, params: { limit: 1000 }

        expect(response.headers["page-limit"]).to eq("50")
      end

      it "exposes the pagination headers to the frontend origin (CORS)" do
        get api_v1_projects_path, headers: { "Origin" => "http://localhost:3001" }

        exposed = response.headers["access-control-expose-headers"].split(",").map(&:strip)
        expect(exposed).to include("link", "current-page", "page-limit", "total-count", "total-pages")
      end
    end
  end

  describe "GET /api/v1/projects/count" do
    it "returns how many projects exist, ignoring list filters" do
      create(:project, :favorite)
      create_list(:project, 2)

      get count_api_v1_projects_path, params: { favorite: "true", q: "xyz" }

      expect(response).to have_http_status(:ok)
      expect(json).to eq("count" => 3)
    end
  end

  describe "GET /api/v1/projects/:id" do
    it "returns the project" do
      project = create(:project)

      get api_v1_project_path(project)

      expect(response).to have_http_status(:ok)
      expect(json["id"]).to eq(project.id)
    end

    it "returns 404 for an unknown project" do
      get api_v1_project_path(0)

      expect(response).to have_http_status(:not_found)
      expect(json).to eq("error" => "Not found")
    end
  end

  describe "POST /api/v1/projects" do
    it "creates the project with a cover" do
      params = { project: valid_attributes.merge(cover: fixture_file_upload("cover.png", "image/png")) }

      expect { post api_v1_projects_path, params: params }
        .to change(Project, :count).by(1)
        .and change(ActiveStorage::Attachment, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json["name"]).to eq("Projeto Iridium")
      expect(json["cover_url"]).to match(%r{/rails/active_storage/})
    end

    it "ignores remove_cover" do
      post api_v1_projects_path, params: { project: valid_attributes.merge(remove_cover: "true") }

      expect(response).to have_http_status(:created)
    end

    it "returns field errors in pt-BR" do
      params = { project: valid_attributes.merge(name: "Iridium", end_date: "") }

      expect { post api_v1_projects_path, params: params }.not_to change(Project, :count)

      expect(response).to have_http_status(:unprocessable_content)
      expect(json["errors"]).to include(
        "name" => [ "Por favor, digite ao menos duas palavras" ],
        "end_date" => [ "Selecione uma data válida" ]
      )
    end

    it "returns 400 without the project key" do
      post api_v1_projects_path, params: { name: "Projeto Iridium" }

      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "PATCH /api/v1/projects/:id" do
    let(:project) { create(:project) }

    it "updates the project" do
      patch api_v1_project_path(project), params: { project: { name: "Projeto Renomeado" } }

      expect(response).to have_http_status(:ok)
      expect(project.reload.name).to eq("Projeto Renomeado")
    end

    it "favorites and unfavorites with a JSON body" do
      patch api_v1_project_path(project), params: { project: { favorite: true } }, as: :json
      expect(project.reload.favorite).to be(true)

      patch api_v1_project_path(project), params: { project: { favorite: false } }, as: :json
      expect(project.reload.favorite).to be(false)
    end

    context "when the project has a cover" do
      let(:project) { create(:project, :with_cover) }

      it "removes the cover with remove_cover=true" do
        patch api_v1_project_path(project), params: { project: { remove_cover: "true" } }

        expect(response).to have_http_status(:ok)
        expect(project.reload.cover).not_to be_attached
        expect(json["cover_url"]).to be_nil
      end

      it "keeps the cover when the edit is rejected" do
        patch api_v1_project_path(project), params: { project: { name: "Curto", remove_cover: "true" } }

        expect(response).to have_http_status(:unprocessable_content)
        expect(project.reload.cover).to be_attached
      end
    end
  end

  describe "DELETE /api/v1/projects/:id" do
    it "deletes the project" do
      project = create(:project)

      expect { delete api_v1_project_path(project) }.to change(Project, :count).by(-1)
      expect(response).to have_http_status(:no_content)
    end
  end
end
