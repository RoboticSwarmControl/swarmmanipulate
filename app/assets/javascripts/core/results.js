swarmcontrol.results = (function () {

    var init = function ( $container, taskResults) {

        // group results by task
        results = _.groupBy( taskResults, function (res) { return res.task;} );

        // for each task...
        _.each( _.keys(results), function (k) {
            // ...init the graph it'll go into...            
            var $task = $(".-chart-"+k);
            res = results[k];

            // ...and add the data points for the graph...
            var points = [];
            var tmax=Number.MIN_VALUE, tmin=Number.MAX_VALUE, rmax=Number.MIN_VALUE, rmin=Number.MAX_VALUE;

            _.each( res, function (r) {
                
                tmax = tmax < r.runtime ? r.runtime : tmax;
                tmin = tmin > r.runtime ? r.runtime : tmax;
                rmax = rmax < r.robot_count ? r.robot_count : rmax;
                rmin = rmin > r.robot_count ? r.robot_count : rmin;

                points.push( [r.robot_count, r.runtime] );
            });

            // ...and then append the graph.             
            Flotr.draw( $task[0],
                        [
                            {data: points, label: 'labals!', points: {show:true}}
                        ],
                        {
                            xaxis: { min: .9*rmin, max: 1.1*rmax},
                            yaxis: { min: .9*tmin, max: 1.1*tmax} 
                        });
        });
    };
    return { init: init
    };
})();
