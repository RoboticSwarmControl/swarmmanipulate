swarmcontrol.results = (function () {

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

        // for each task...
        _.each( _.keys(results), function (k) {
            // ...init the graph it'll go into...            
            var $task = $(".-chart-"+k);
            res = results[k];

            var d2    = [], // A regression line for the scatterplot. 
            sx    = 0,
            sy    = 0,
            sxy   = 0,
            sxsq  = 0,
            xmean,
            ymean,
            alpha,
            beta,x,y,
            n;

 /*           //are there multiple modes?
            modes = _.groupBy( res, function (m) { return m.mode;} );
            if (_.keys(modes) != "null") //(modes.keys(obj).length > 1)  // if there are several modes, use modes as x-axis
            {
                // two options A.) the modes are strings, B.) the modes are numbers.  If numbers, we do a normal xy graph. 
                // If the string argument cannot be parsed as a decimal number, the result will be NaN (not-a-number value).
                           // ...and add the data points for the graph...
                var points = [];
                var tmax=Number.MIN_VALUE, tmin=Number.MAX_VALUE, xmax=Number.MIN_VALUE, xmin=Number.MAX_VALUE;

                _.each( res, function (r) {
                    
                    tmax = tmax < r.runtime ? r.runtime : tmax;
                    tmin = tmin > r.runtime ? r.runtime : tmax;
                    xmax = xmax < r.robot_count ? r.robot_count : xmax;
                    xmin = xmin > r.robot_count ? r.robot_count : xmin;

                    points.push( [r.robot_count, r.runtime] );
                });

                // ...and then append the graph.             
                Flotr.draw( $task[0],
                            [
                                {data: points, label: 'labels!', points: {show:true}}
                            ],
                            {
                                xaxis: { min: .9*xmin, max: 1.1*xmax,title: 'Mode'},
                                yaxis: { min: .9*tmin, max: 1.1*tmax, title: "Time (s)"}
                            });
            }else*/
            {
                // ...and add the data points for the graph...
                var points = [];
                var ymax=Number.MIN_VALUE, ymin=Number.MAX_VALUE, xmax=Number.MIN_VALUE, xmin=Number.MAX_VALUE;

                n = 0;
                _.each( res, function (r) {
                    y = parseFloat(r.runtime);
                    x = r.robot_count;
                    
                    ymax = ymax < y ? y : ymax;
                    ymin = ymin > y ? y : ymin;
                    xmax = xmax < x ? x : xmax;
                    xmin = xmin > x ? x : xmin;

                    points.push( [x, y] );

                    // Computations used for regression line
                    sx += x;
                    sy += y;
                    sxy += x*y;
                    sxsq += Math.pow(x,2);
                    n = n+1;

                });

                xmean = sx/n;
                ymean = sy/n;
                beta  = ((n*sxy) - (sx*sy))/((n*sxsq)-(Math.pow(sx,2)));
                alpha = ymean - (beta * xmean);

                // Compute the regression line.
                d2.push([xmin, alpha + beta*xmin]);
                d2.push([xmax, alpha + beta*xmax]);
                var xrange = xmax-xmin;
                var yrange = ymax-ymin;

modes = _.groupBy( res, function (m) { return m.mode;} );
robotCounts = _.groupBy( res, function (m) { return m.robot_count;} );
var mtitle = "There are " + _.keys(modes).length  + " modes, and " + _.keys(robotCounts).length + "different # of robots."

                // ...and then append the graph. 
                var margins = 0.05;            
                Flotr.draw( $task[0],
                    [
                        {data: d2, label : 'trendline' },  // Regression
                        {data: points, label: 'datapoints', points: {show:true}}
                    ],
                    {
                        xaxis: { min: xmin - margins*xrange, max: xmax + margins*xrange,title: 'Number of robots'},
                        yaxis: { min: ymin - margins*yrange, max: ymax + margins*yrange, title: "Time (s)"},
                        title :mtitle
                    });
            }

        });
    };
    return { init: init
    };
})();


