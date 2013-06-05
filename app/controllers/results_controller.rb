require 'csv'

class ResultsController < ApplicationController
    def new
    end

    def create
        #@result = Result.new( :task=>params[:task], :participant=>params[:participant], :runtime=>params[:runtime] )
        @result = Result.new( :task=>params[:task], :participant=>request.remote_ip, :runtime=>params[:runtime], :robot_count=>params[:numrobots] )
        @result.save

        redirect_to :action=>'show'
    end

    def show
        @results = Result.find(:all)

        # thie is hacky as hell--you should have this logic neatly
        # wrapped up in the model somehow, or monkeypatch the array
        # class to support a to_csv method.
        @resultscsv = CSV.generate do |csv|
            csv << [ "Task", "Participant", "Run time", "Created at", "Robot count" ]
            @results.each do |r|
                csv << [ "#{r.task}", "#{r.participant}", "#{r.runtime}", "#{r.created_at}", "#{r.robot_count}" ]
            end
        end

        respond_to do |format|
            format.html { render "show_results", :locals=>{:results=>@results} }
            format.csv { send_data @resultscsv }
            format.json { send_data ({"results"=>@results}.to_json) }
        end
    end

    def edit
    end

    def update
    end

    def destroy
    end

end
