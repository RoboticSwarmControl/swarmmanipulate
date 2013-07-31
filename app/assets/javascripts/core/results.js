swarmcontrol.results = (function () {

    var init = function ( $container, taskResults) {
        // TODO:
        // * add axis-labels (DONE, ATB)
        // * add legend (Done, ATB)
        // * plot tasks with modes with the modes along the x-axis 
        // * add a trendline (DONE, ATB)
        // * color points from the user in red, give user a trend line  (participant)
        // * allow user to switch between candle and scatter plots
        // * add a delete key so user can assign all user's data to an anonymous value

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

        // group results by task
        results = _.groupBy( taskResults, function (res) { return res.task;} );


        // for each task...
        _.each( _.keys(results), function (k) {
            // ...init the graph it'll go into...            
            var $task = $(".-chart-"+k);
            res = results[k];

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
                    ymin = ymin > y ? y : ymax;
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

                // ...and then append the graph.             
                Flotr.draw( $task[0],
                    [
                        {data: d2, label : 'trendline' },  // Regression
                        {data: points, label: 'datapoints', points: {show:true}}
                    ],
                    {
                        var xrange = xmax-xmin;
                        var yrange = ymax-ymin;
                        xaxis: { min: xmin - 0.05*xrange, max: xmax + 0.05*xrange,title: 'Number of robots'},
                        yaxis: { min: ymin - 0.05*yrange, max: ymax + 0.05*yrange, title: "Time (s)"}
                    });
            }

        });
    };
    return { init: init
    };
})();


