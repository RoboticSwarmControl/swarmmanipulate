class AddModeToResult < ActiveRecord::Migration
  def change
      add_column :results, :mode, :string
  end
end
