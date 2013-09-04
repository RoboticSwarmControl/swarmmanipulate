class Result < ActiveRecord::Base
    attr_accessible :task, :participant, :runtime, :robot_count, :mode, :agent
end
