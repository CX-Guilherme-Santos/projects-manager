require "rails_helper"

RSpec.describe Project do
  subject(:project) { build(:project) }

  describe "associations" do
    it { is_expected.to have_one_attached(:cover) }
  end

  describe "defaults" do
    it "is not a favorite" do
      expect(described_class.new.favorite).to be(false)
    end
  end

  describe "validations" do
    it "is valid with the factory attributes" do
      expect(project).to be_valid
    end

    it { is_expected.to validate_presence_of(:start_date).with_message("Selecione uma data válida") }
    it { is_expected.to validate_presence_of(:end_date).with_message("Selecione uma data válida") }

    describe "name" do
      it "requires at least two words" do
        project.name = "Iridium"

        expect(project).not_to be_valid
        expect(project.errors[:name]).to eq([ "Por favor, digite ao menos duas palavras" ])
      end

      it "ignores extra spaces when counting words" do
        project.name = "  Iridium   "
        expect(project).not_to be_valid

        project.name = "  Projeto   Iridium "
        expect(project).to be_valid
      end
    end

    describe "length" do
      it "accepts names and clients up to 100 characters" do
        project.assign_attributes(name: "Projeto #{"a" * 92}", client: "c" * 100)

        expect(project).to be_valid
      end

      it "rejects longer names and clients" do
        project.assign_attributes(name: "Projeto #{"a" * 93}", client: "c" * 101)

        expect(project).not_to be_valid
        expect(project.errors[:name]).to eq([ "Use no máximo 100 caracteres" ])
        expect(project.errors[:client]).to eq([ "Use no máximo 100 caracteres" ])
      end
    end

    describe "client" do
      it "requires at least one word" do
        project.client = "   "

        expect(project).not_to be_valid
        expect(project.errors[:client]).to eq([ "Por favor, digite ao menos uma palavra" ])
      end
    end

    describe "end_date" do
      it "must be after the start date" do
        project.assign_attributes(start_date: Date.new(2026, 1, 1), end_date: Date.new(2026, 1, 1))

        expect(project).not_to be_valid
        expect(project.errors.details[:end_date]).to include(error: :before_start_date)
      end
    end

    describe "cover" do
      it "accepts jpg and png images" do
        { "cover.png" => "image/png", "cover.jpg" => "image/jpeg" }.each do |file, content_type|
          project = build(:project)
          project.cover.attach(io: file_fixture(file).open, filename: file, content_type: content_type)

          expect(project).to be_valid, "expected #{file} to be accepted"
        end
      end

      it "rejects other file types" do
        project.cover.attach(io: file_fixture("cover.txt").open, filename: "cover.txt", content_type: "text/plain")

        expect(project).not_to be_valid
        expect(project.errors[:cover]).to eq([ "Escolha uma imagem .jpg ou .png" ])
      end

      it "rejects files larger than the limit" do
        project.cover.attach(
          io: StringIO.new("x" * (described_class::COVER_MAX_SIZE + 1)),
          filename: "big.png",
          content_type: "image/png"
        )

        expect(project).not_to be_valid
        expect(project.errors[:cover]).to eq([ "A imagem deve ter no máximo 5 MB" ])
      end
    end
  end

  describe ".favorites" do
    it "returns only favorite projects" do
      favorite = create(:project, :favorite)
      create(:project)

      expect(described_class.favorites).to contain_exactly(favorite)
    end
  end

  describe ".search" do
    it "matches the name or the client, ignoring case" do
      by_name = create(:project, name: "Projeto Iridium", client: "Acme")
      by_client = create(:project, name: "Outro Projeto", client: "Iridium Corp")
      create(:project, name: "Projeto Xenon", client: "Acme")

      expect(described_class.search("iRiD")).to contain_exactly(by_name, by_client)
    end

    it "ignores terms shorter than three characters" do
      create_list(:project, 2)

      expect(described_class.search("ir").count).to eq(2)
      expect(described_class.search("  ").count).to eq(2)
    end

    it "treats LIKE wildcards as plain text" do
      create(:project, name: "Projeto 100% digital", client: "Acme")
      create(:project, name: "Projeto 1000 clientes", client: "Acme")

      expect(described_class.search("100%").pluck(:name)).to eq([ "Projeto 100% digital" ])
    end
  end

  describe ".sorted_by" do
    it "orders by name, ignoring case" do
      create(:project, name: "beta projeto")
      create(:project, name: "Alfa projeto")
      create(:project, name: "Gama projeto")

      expect(described_class.sorted_by("name").pluck(:name)).to eq([ "Alfa projeto", "beta projeto", "Gama projeto" ])
    end

    it "orders by the most recent start date with recent_start" do
      create(:project, name: "Projeto antigo", start_date: Date.new(2026, 1, 1))
      create(:project, name: "Projeto novo", start_date: Date.new(2026, 6, 1))

      expect(described_class.sorted_by("recent_start").pluck(:name)).to eq([ "Projeto novo", "Projeto antigo" ])
    end

    it "lists running projects by end date and finished ones last with nearest_end" do
      travel_to Date.new(2026, 11, 10) do
        create(:project, name: "Projeto encerrado", start_date: Date.new(2026, 1, 1), end_date: Date.new(2026, 3, 1))
        create(:project, name: "Projeto distante", start_date: Date.new(2026, 1, 1), end_date: Date.new(2027, 6, 1))
        create(:project, name: "Projeto proximo", start_date: Date.new(2026, 1, 1), end_date: Date.new(2026, 11, 20))

        expect(described_class.sorted_by("nearest_end").pluck(:name))
          .to eq([ "Projeto proximo", "Projeto distante", "Projeto encerrado" ])
      end
    end

    it "falls back to alphabetical order for unknown keys" do
      create(:project, name: "Beta projeto")
      create(:project, name: "Alfa projeto")

      expect(described_class.sorted_by("DROP TABLE projects").pluck(:id))
        .to eq(described_class.sorted_by("name").pluck(:id))
    end
  end
end
