class Task
    PrettyNames = { "maze_positioning" => "Varying number",
                    "varying_control" => "Varying control",
                    "varying_visualization" => "Varying visualization",
                    "pyramid_building" => "Pyramid building",
                    "robot_positioning" => "Robot positioning" }

    class << self
        def get_pretty_task_name name
            PrettyNames[name]
        end
    end
end
