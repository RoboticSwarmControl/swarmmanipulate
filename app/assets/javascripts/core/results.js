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
            _.each( res, function (r) {
                points.push( [r.robot_count, r.runtime] );
            });

            // ...and then append the graph.
             
            Flotr.draw( $task[0],
                        [
                            {data: points, label: 'labals!', points: {show:true}}
                        ],
                        {});
        });
    };
    return { init: init
    };
})();
