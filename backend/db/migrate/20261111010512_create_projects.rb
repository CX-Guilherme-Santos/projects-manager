class CreateProjects < ActiveRecord::Migration[8.1]
  INDEXED_COLUMNS = %i[favorite start_date end_date].freeze

  def up
    unless table_exists?(:projects)
      create_table :projects do |t|
        t.string :name, null: false
        t.string :client, null: false
        t.date :start_date, null: false
        t.date :end_date, null: false
        t.boolean :favorite, null: false, default: false

        t.timestamps
      end
    end

    INDEXED_COLUMNS.each do |column|
      add_index :projects, column unless index_exists?(:projects, column)
    end
  end

  def down
    return unless table_exists?(:projects)

    INDEXED_COLUMNS.each do |column|
      remove_index :projects, column if index_exists?(:projects, column)
    end

    drop_table :projects
  end
end
