/*
 * baseTask.js -- Base task class for the ensemble manipulation app.
 * Copyright 2013 Chris Ertel
 *
 * NOTES:
 * This is the base class from which all other tasks are descended.
 *
 * This provides the basic run, update, and draw loop, and defers to
 * subclass methods to actually implement behavior.
 *
 * To make a new task, you extend this via _.extend() and override the
 * setupGoals, setupRobots, setupProps, and evaluateCompletion functions.
 *
 * USAGE:
 * var mytask = new myTask(); // assume myTask extends baseTask
 * mytask.init( { $canvas: $("#canvas") } );    // assume #canvas is where to draw
 *
 */

var baseTask = {
    taskName: "base task",

    /*
     * Function to setup the task.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    setupTask: function( options ) {
    },
    
    /*
     * Function to setup controller method.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    setupController: function( options ) {
    },

    /*
     * Function to evaluate whether or not a task has been completed.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    evaluateCompletion: function( options ) {
        return false;
    },

    /* 
     * Function to handle drawing the simulation.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    draw: function( options ) {
    },

    /*
     * Function to handle updating the simulation.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    update: function( options ) {
    },

    _robots: [],
    _runtime: 0,
    _startTime: null,

    /*
     * Function to initialize and begin the task.
     * This generally SHOULD NOT be overidden.
     * @param options -- object of options to pass.
     *                   Options include:
     *                   {
     *                      "$canvas": jQuery canvas element to draw to
     *                   }
     *
     *                   Other options depend on the subclass.
     */
    init: function( options ) {
        this._options = options;

        // setup the draw utilities
        drawutils.init();

        // setup the simulation
        this.setupTask( this._options );

        // register the handlers
        this.setupController( this._options );

        // initialize the time
        this._startTime = new Date();
        this._runtime = 0.0;

        // do the loop
        requestAnimFrame( this._update );
    },

    /*
     * Function to run the simulation.
     * This generally SHOULD NOT be overidden.
     */
    _update: function( ) {
        // draw the simulation
        this.update( this._options );
        this.draw( this._options );

        // check to see if we've reached completion.
        if ( this.evaluateCompletion( this._options ) ) {
            // if so, post our results to the server.
            alert("Task complete. Time to finish was "+ this._runtime +" seconds.");
            $.ajax( { type: "POST",
                      url: "/result",
                      dataType: "json",
                      async: false,
                      data: { task:this.taskName, runtime:this._runtime, participant:"web"}
            });

            // at this point, we do not reschedule, and the task ends.
            return;
        } else {
            // if not, schedule ourselves again and update the time.
            // Mr. Bones says, "The ride never ends!"
            requestAnimFrame( this._update );
            this._runtime = (new Date().getTime() - this._startTime)/1000.0; 
        }
    }
};

