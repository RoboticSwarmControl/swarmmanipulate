require 'csv'
require 'digest/md5'

class ResultsController < ApplicationController
    def new
    end

    def create
        @result = Result.new( :task=>params[:task],
                              :mode=>params[:mode],
                              :participant=>Digest::MD5.hexdigest(request.remote_ip),
                              :runtime=>params[:runtime],
                              :robot_count=>params[:numrobots] )
        @result.save

        redirect_to :action=>'show'
    end

    def show
        gon.results = Result.find(:all)
        @results = gon.results

        respond_to do |format|
            format.html do
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
                        csv << [ "#{r.task}", "#{r.mode}", "#{r.participant}", "#{r.runtime}", "#{r.created_at}", "#{r.robot_count}" ]
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
