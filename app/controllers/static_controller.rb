class StaticController < ApplicationController
    def task

        @task_name = params[:task_name]
        @task_name_pretty = params[:task_name]

        render :layout=>"task"

    end

    def landing
    end
end
