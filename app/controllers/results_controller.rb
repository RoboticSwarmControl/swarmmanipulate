require 'csv'
require 'google_chart'
require 'digest/md5'

class ResultsController < ApplicationController
    def new
    end

    def create
        #@result = Result.new( :task=>params[:task], :participant=>params[:participant], :runtime=>params[:runtime] )
        @result = Result.new( :task=>params[:task],
                              :mode=>params[:mode],
                              :participant=>Digest::MD5.hexdigest(request.remote_ip),
                              :runtime=>params[:runtime],
                              :robot_count=>params[:numrobots] )
        @result.save

        redirect_to :action=>'show'
    end

    def show
        @results = Result.find(:all)

        # thie is hacky as hell--you should have this logic neatly
        # wrapped up in the model somehow, or monkeypatch the array
        # class to support a to_csv method.
        @resultscsv = CSV.generate do |csv|
            csv << [ "Task", "Mode", "Participant", "Run time", "Created at", "Robot count" ]
            @results.each do |r|
                csv << [ "#{r.task}", "#{r.mode}", "#{r.participant}", "#{r.runtime}", "#{r.created_at}", "#{r.robot_count}" ]
            end
        end

        respond_to do |format|
            format.html do
                @charts = {}
                @tasknames = @results.map( &:task ).uniq
                @tasknames.each do |taskname|
                    GoogleChart::ScatterChart.new("520x400","Task: #{taskname}") do |sc|
                        dataset = Result.where("task=?",taskname)
                        rt = dataset.map( &:runtime ).map! { |t| t.to_f }
                        tmax = rt.max
                        rc = dataset.map( &:robot_count)
                        cmax = rc.max

                        sc.data "Scatter Set", rc.zip(rt)
                        sc.max_value [cmax,tmax]
                        sc.axis :x, :range=>[0,cmax], :title=>"# of robots"
                        sc.axis :y, :range=>[0,tmax], :title=>"Time to completion (sec)"
                        @charts[taskname] = sc.to_url
                    end
                end

                render "show_results", :locals=>{:results=>@results, :charts=>@charts}
            end

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
