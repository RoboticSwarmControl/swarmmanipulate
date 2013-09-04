require 'csv'
require 'digest/md5'

class ResultsController < ApplicationController
    def new
    end

    def create
        @result = Result.new( :task=>params[:task],
                              :mode=>params[:mode],
                              :participant=>cookies["task_sig"],
                              :runtime=>params[:runtime],
                              :robot_count=>params[:numrobots],
                              :agent => params[:agent])
        @result.save

        redirect_to :action=>'show'
    end

    def show

        if request[:task] 
            @results = Result.find_all_by_task( request[:task] )
        else
           @results = Result.find(:all)
        end

        respond_to do |format|
            format.html do
                gon.results = @results
                @charts = @results.map( &:task ).uniq.inject([]){ |acc,taskname| acc << taskname} 
                render "show_results", :locals=>{:results=>@results, :charts=>@charts}
            end

            format.csv do 
                # thie is hacky as hell--you should have this logic neatly
                # wrapped up in the model somehow, or monkeypatch the array
                # class to support a to_csv method.
                @resultscsv = CSV.generate do |csv|
                    csv << [ "Task", "Mode", "Participant", "Run time", "Created at", "Robot count" ]
                    @results.each do |r|
                        csv << [ "#{r.task}", "#{r.mode}", "#{r.participant}", "#{r.runtime}", "#{r.created_at}", "#{r.robot_count}", "#{r.agent}" ]
                    end
                end
                send_data @resultscsv
            end

            format.json do
                send_data ({"results"=>@results}.to_json)
            end
        end
    end

    def edit
    end

    def update
    end

    def destroy
    end

end
