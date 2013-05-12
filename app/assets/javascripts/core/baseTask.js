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
     * Function to setup goals.
     * This should be overridden by the user as needed.
     * @param goals -- in/out initially empty array of goal objects
     * @param options -- object of options that might be important
     */
    setupGoals: function( goals, options ) {
    },

    /*
     * Function to setup robots.
     * This should be overridden by the user as needed.
     * @param goals -- in/out initially empty array of robot objects
     * @param options -- object of options that might be important
     */
    setupRobots: function( robots, options ) {
    },

    /*
     * Function to setup the static props.
     * This should be overridden by the user as needed.
     * @param staticProps -- in/out initially empty array of static props
     * @param options -- object of options that might be important
     */
    setupStaticProps: function( staticProps, options ) {
    },

    /*
     * Function to setup the dynamic props.
     * This should be overridden by the user as needed.
     * @param staticProps -- in/out initially empty array of dynamic props
     * @param options -- object of options that might be important
     */
    setupDynamicProps: function( dynamicProps, options ) {
    },
    
    /*
     * Function to setup controller method.
     * This should be overridden by the user as needed.
     * @param robots -- in array of robots to control
     * @param options -- object of options that might be important
     */
    setupController: function (robots, options) {
    },

    /*
     * Function to evaluate whether or not a task has been completed.
     * This should be overridden by the user as needed.
     * @param goals -- array of goal objects
     * @param props -- array of dynamic props
     * @param robots -- array of robots
     */
    evaluateCompletion: function( goals, props, robots) {
        return false;
    },

    /* 
     * Function to handle drawing the simulation.
     * This should be overridden by the user as needed.
     */
    draw: function() {
    },

    /*
     * Function to handle updating the simulation.
     * This should be overridden by the user as needed.
     */
    update: function() {
    },

    goals: [],
    robots: [],
    staticProps: [],
    dynamicProps: [],
    runtime: 0,
    startTime: null,

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
        // setup the draw utilities
        drawutils.init();

        // setup the simulation
        this.setupGoals(goals, options);
        this.setupRobots(robots, options);
        this.setupStaticProps(staticProps, options);
        this.setupDynamicProps(dynamicProps, options);

        // register the handlers
        this.setupController(robots, options);

        // initialize the time
        this.startTime = new Date();
        this.runtime = 0.0;

        // do the loop
        requestAnimFrame( this._update );
    },

    /*
     * Function to run the simulation.
     * This generally SHOULD NOT be overidden.
     */
    _update: function() {
        // draw the simulation
        this.draw();
        this.update();

        // check to see if we've reached completion.
        if ( this.evaluateCompletion(goals, dynamicProps, robots) ) {
            // if so, post our results to the server.
            alert("Task complete. Time to finish was "+ this.runtime +" seconds.");
            $.ajax( { type: "POST",
                      url: "/result",
                      dataType: "json",
                      async: false,
                      data: { task:this.taskName, runtime:this.runtime, participant:"web"}
            });
            // at this point, we do not reschedule, and the task ends.
        } else {
            // if not, schedule ourselves again and update the time.
            // Mr. Bones says, "The ride never ends!"
            requestAnimFrame( this._update );
            this.runtime = (new Date().getTime() - this.timeStart)/1000.0; 
        }
    }
};
