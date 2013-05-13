/*
 * massive_manipulation.js -- Massive robot manipulation demo
 * Copyright 2013 Aaron Becker, Chris Ertel
 */

var app = (function () {
    var registeredTasks = [];
    var registerTask = function( task ) {
        registeredTasks.push(task);
    };
     
    var init = function( taskname, options ) {
        // make sure that we have the requested task registered with the app
        task = _.find( registeredTasks, function(t){ return t.taskName === taskname; });
        if ( !task) {
            // if we don't have the task, abort
            alert("Unable to find task " + taskname );
            return;
        }

        // initialize the new task
        task.init();
    };
    return { init: init,
             registerTask: registerTask};
})(); 
