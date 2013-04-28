class CreateResults < ActiveRecord::Migration
  def change
      create_table :results do |t|
          t.string :task
          t.string :participant
          t.string :runtime

          t.timestamps
      end
  end
end
