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
    shownNotice: false,
    instructions: "Default instructions.",
    firstKeyPressed : false,
    isTaskComplete : false,

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
    setupController: function ( options ) {
        var that = this;
        /* setup key listeners */
	//todo: this should be shared code
        document.addEventListener( "keydown", function(e){
            switch (e.keyCode) {
                case 37 : that._impulseV.x = -that._impulse; break; //left
                case 39 : that._impulseV.x = that._impulse; break;  //right
                case 38 : that._impulseV.y = -that._impulse; break; //down
                case 40 : that._impulseV.y = that._impulse; break;  //up
                case 65 : that._impulseV.x = -that._impulse; break;
                case 68 : that._impulseV.x = that._impulse; break;
                case 87 : that._impulseV.y = -that._impulse; break;
                case 83 : that._impulseV.y = that._impulse; break;
            }
        //check if this is the first keypress -- TODO:  this should be shared code.
	if( that.firstKeyPressed == false && Math.abs(that._impulseV.x) + Math.abs(that._impulseV.y) > 0)
            { 
            that.firstKeyPressed  = true;
            that._startTime = new Date();
            that._runtime = 0.0;
            }
	} , false );

        document.addEventListener( "keyup", function(e){
            switch (e.keyCode) {
                case 37 : that._impulseV.x = 0; break;
                case 39 : that._impulseV.x = 0; break;
                case 38 : that._impulseV.y = 0; break;
                case 40 : that._impulseV.y = 0; break;
                case 65 : that._impulseV.x = 0; break;
                case 68 : that._impulseV.x = 0; break;
                case 87 : that._impulseV.y = 0; break;
                case 83 : that._impulseV.y = 0; break;
            }} , false );
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

    _runtime: 0,
    _startTime: null,

    /*
     * Function to initialize and begin the task.
     * This generally SHOULD NOT be overridden.
     * @param options -- object of options to pass.
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

        // add instructions to the page
        $("#task-instructions").empty();
        $("#task-instructions").append( $( "<h4>How to play</h4><p>" + this.instructions + "<p>") );

        // do the loop
        requestAnimFrame( this._update );
    },

    /*
     * Function to run the simulation.
     * This generally SHOULD NOT be overridden.
     */
    _update: function( ) {
        // step and draw the simulation
        this.update( this._options );
        this.draw( this._options );

	string = "<strong>Time:</strong> " + (this._runtime).toFixed(2) + "s";
        $('#taskFeedback').html(string);
        // check to see if we've reached completion.
        if ( this.isTaskComplete == false && this.evaluateCompletion( this._options ) ) {
            // if so, post our results to the server.
	    // TODO: don't use a dialog box.  Instead, halt the program and overlay a "Task Complete"
            alert("Task complete. Time to finish was "+ this._runtime +" seconds.  Reload to start again.");
            $.ajax( { type: "POST",
                      url: "/result",
                      dataType: "json",
                      async: false,
                      data: { task:this.taskName, runtime:this._runtime, participant:"web"}
            });
            this.isTaskComplete = true;

            // at this point, we do not reschedule, and the task ends.
            return;
        } else {
            // if not, schedule ourselves again and update the time.
            // Mr. Bones says, "The ride never ends!"
            requestAnimFrame( this._update );
	    if( this.firstKeyPressed == true)
	       this._runtime = (new Date().getTime() - this._startTime)/1000.0; 
	    else
               this._runtime = 0.00;
        }
    }
};

