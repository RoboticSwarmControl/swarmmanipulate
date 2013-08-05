swarmcontrol.results = (function () {

    var trendline = function ( pts){
        var d2    = [], // A regression line for the scatterplot. 
            sx    = 0,
            sy    = 0,
            sxy   = 0,
            sxsq  = 0,
            xmean,x,y,
            ymean,
            alpha,
            beta,n;
            n = 0;
            for( var i = 0; i<pts.length; i++){
                // Computations used for regression line
                x = pts[i][0];
                y = pts[i][1];
                if( ~isNaN(x) && ~isNaN(y)){
                    sx += x;
                    sy += y;
                    sxy += x*y;
                    sxsq += Math.pow(x,2);
                    n=n+1;
                }
            }
            xmean = sx/n;
            ymean = sy/n;
            beta  = ((n*sxy) - (sx*sy))/((n*sxsq)-(Math.pow(sx,2)));
            alpha = ymean - (beta * xmean);
            return [alpha,beta];
    }

    var init = function ( $container, taskResults) {
        // uses flotr2 at http://www.humblesoftware.com/flotr2/#!basic-axis
        // TODO:
        // * add axis-labels (DONE, ATB)
        // * add legend (Done, ATB)
        // * plot tasks with modes with the modes along the x-axis 
        // * add a trendline (DONE, ATB)
        // * color points from the user in red, give user a trend line  (participant)
        // * allow user to switch between candle and scatter plots
        // * add a delete key so user can assign all user's data to an anonymous value

        // group results by task
        results = _.groupBy( taskResults, function (res) { return res.task;} );
        var myParticipant = null; //Digest::MD5.hexdigest(request.remote_ip);
        // for each task...
        _.each( _.keys(results), function (k) {
            // ...init the graph it'll go into...            
            var $task = $(".-chart-"+k);
            res = results[k];

            var d2    = [], // A regression line for the scatterplot. 
            dme = [], //regression line of my data
            x,y;

                 // two tasks where the number of robots is varied: maze_positioning, robot_positioning 
                 // varying_control, varying_visualization  x-axis is the mode (string) (these are bar charts?)
                 //  pyramid_building  is a function of the noise, saves as the mode
                // ...and add the data points for the graph...
                var points = [];  //all data points
                var mypoints = []; //my data points
                var ymax=Number.MIN_VALUE, ymin=Number.MAX_VALUE, xmax=Number.MIN_VALUE, xmin=Number.MAX_VALUE;
                var xAxisLabel = '';

                n = 0;
                modes = _.groupBy( res, function (m) { return m.mode;} );
                var modekeys = _.keys(modes);

                _.each( res, function (r) {
                    y = parseFloat(r.runtime);
                    if (y > 60*60){y = NaN;}  //remove egregious outliers -- if a task takes more than an hour, that's rediculous
                    
                    if (r.task == "maze_positioning" || r.task == "robot_positioning"){
                        xAxisLabel = 'Number of robots';
                        x = r.robot_count;
                    }else if (r.task == "varying_control" ){
                        xAxisLabel = 'Control type';
                        x = _.indexOf(modekeys, r.mode);
                    }else if(r.task == "varying_visualization"){
                        xAxisLabel = 'Visualization Method';
                        x = _.indexOf(modekeys, r.mode);
                    }else if(r.task == "pyramid_building"){
                        xAxisLabel = 'Noise';
                        x = parseFloat(r.mode);
                    }else{
                        xAxisLabel = 'Unknown';
                        x = r.robot_count;
                    }

                    ymax = ymax < y ? y : ymax;
                    ymin = ymin > y ? y : ymin;
                    xmax = xmax < x ? x : xmax;
                    xmin = xmin > x ? x : xmin;

                    points.push( [x, y] );
                    if( r.participant ==myParticipant)
                    {  mypoints.push( [x, y] );}

                });

                // Compute the regression line.
                var dataTrendline = trendline(points);
                d2.push([xmin, dataTrendline[0] + dataTrendline[1]*xmin]);
                d2.push([xmax, dataTrendline[0] + dataTrendline[1]*xmax]);
                var mydataTrendline = trendline(mypoints);
                dme.push([xmin, mydataTrendline[0] + mydataTrendline[1]*xmin]);
                dme.push([xmax, mydataTrendline[0] + mydataTrendline[1]*xmax]);
                var xrange = xmax-xmin;
                var yrange = ymax-ymin;

robotCounts = _.groupBy( res, function (m) { return m.robot_count;} );
var mtitle = res[0].task + ' with ' + res.length + " results, there are " + _.keys(modes).length  + " modes, and " + _.keys(robotCounts).length + " different # of robots."

                // ...and then append the graph. 
                var margins = 0.05;   
                var myTicks = null;
                if(res[0].task == "varying_control" || res[0].task == "varying_visualization"){
                    myTicks = [];
                    for( var i = 0; i<modekeys.length; i++)
                    {myTicks.push([i, modekeys[i] ]);}    
                }
                Flotr.draw( $task[0],
                    [
                        {data: d2, label : 'trendline', color:'blue' },  // Regression
                        {data: points, label: 'all results', points: {show:true}, color:'darkblue' },
                        {data: dme, label : 'my trendline', color:'red' },  // Regression
                        {data: mypoints, label: 'my results', points: {show:true}, color:'darkred' }
                    ],
                    {  
                        xaxis: { min: xmin - margins*xrange, 
                                max: xmax + margins*xrange, 
                                title: xAxisLabel,
                                ticks: myTicks,
                                labelsAngle: 45
                            },
                        yaxis: { min: ymin - margins*yrange, max: ymax + margins*yrange, title: "Time (s)"},
                        title :mtitle
                    });


        });
    };
    return { init: init
    };
})();


