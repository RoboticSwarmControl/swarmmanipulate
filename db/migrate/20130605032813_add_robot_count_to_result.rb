class AddRobotCountToResult < ActiveRecord::Migration
  def change
      add_column :results, :robot_count, :integer
  end
end
