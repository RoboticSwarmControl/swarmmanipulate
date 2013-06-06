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
    keyL: null,
    keyR: null,
    keyU: null,
    keyD: null,

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
        document.addEventListener( "keydown", function(e){
            switch (e.keyCode) {
                case 37 : if(that.keyL==null){that.keyL = new Date().getTime();} break; //left
                case 39 : if(that.keyR==null){that.keyR = new Date().getTime();}  break;  //right
                case 38 : if(that.keyU==null){that.keyU = new Date().getTime();}  break; //down
                case 40 : if(that.keyD==null){that.keyD = new Date().getTime();}  break;  //up
                case 65 : if(that.keyL==null){that.keyL = new Date().getTime();}  break;
                case 68 : if(that.keyR==null){that.keyR = new Date().getTime();}  break;
                case 87 : if(that.keyU==null){that.keyU = new Date().getTime();}  break;
                case 83 : if(that.keyD==null){that.keyD = new Date().getTime();}  break;
            }
        //check if this is the first valid keypress, if so, starts the timer
	if( that._startTime == null && ( that.keyL != null || that.keyR != null || that.keyU != null || that.keyD != null))
            { 
            that._startTime = new Date().getTime();
            that._runtime = 0.0;
            }
	} , false );

        document.addEventListener( "keyup", function(e){
            switch (e.keyCode) {
                case 37 : that.keyL = null; break;
                case 39 : that.keyR = null; break;
                case 38 : that.keyU = null; break;
                case 40 : that.keyD = null; break;
                case 65 : that.keyL = null; break;
                case 68 : that.keyR = null; break;
                case 87 : that.keyU = null; break;
                case 83 : that.keyD = null; break;
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
        // step the simulation
        // TODO: Have the update run multiple times if the delay incurred by 
        // requestAnimFrame is greater than 60hz.
        this.update( this._options );

        // draw the simulation
        this.draw( this._options );

    	string = "<strong>Time:</strong> " + (this._runtime).toFixed(2) + "s";
        $('#taskFeedback').html(string);
        // check to see if we've reached completion.
        if ( this.isTaskComplete == false && this.evaluateCompletion( this._options ) ) {
            // if so, post our results to the server.
	    // TODO: don't use a dialog box.  Instead, halt the program and overlay a "Task Complete"
            $.ajax( { type: "POST",
                      url: "/result",
                      dataType: "json",
                      async: false,
                      data: { task:this.taskName, runtime:this._runtime, numrobots:this._numrobots, participant:"web"}
            });
            this.isTaskComplete = true;
                    // draw seethrough grey box
            drawutils.drawRect(300,300, 590,590, "rgba(200, 200, 200, 0.8)");
            $("canvas").drawText({
              fillStyle: "green",
              fontSize: "50pt",
              strokeStyle: "green",
              scale: 2,
              strokeWidth: 0,
              x: 300, y: 200,
              text: "Task completed in "+ (this._runtime).toFixed(2) +" seconds!"
            });
        //    alert("Task complete. Time to finish was "+ this._runtime +" seconds.  Reload to start again.");
            // at this point, we do not reschedule, and the task ends.
            return;
        } else {
            // if not, schedule ourselves again and update the time.
            // Mr. Bones says, "The ride never ends!"
            requestAnimFrame( this._update );
	    if( this._startTime == null)
               this._runtime = 0.00;
	    else
               this._runtime = (new Date().getTime() - this._startTime)/1000.0;
        }

    }
};

