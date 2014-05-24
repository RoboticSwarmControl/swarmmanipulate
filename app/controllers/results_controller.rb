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
                              :agent => params[:agent],
                              :aborted => params[:aborted])
        @result.save

        respond_to do |format|
            format.json do
                send_data @result.to_json, :status=>201
            end
        end
    end

    def show
        # add filters here to sort by more params 
        criteria = ["task", "participant"]
        @results = Result.where( params.select { |k,v| criteria.include? k}).all

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
                    csv << [ "Task", "Mode", "Participant", "Run time", "Created at", "Robot count"]
                    @results.each do |r|
                        begin
                        csv << [ "#{r.task}", "#{r.mode}", "#{r.participant}", "#{r.runtime}", "#{r.created_at}", "#{r.robot_count}", "#{r.agent}"]
                        rescue
                        end
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
