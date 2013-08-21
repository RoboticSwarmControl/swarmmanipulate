/*
 * baseTask.js -- Base task class for the SwarmControl manipulation app.
 * Copyright 2013 Chris Ertel, Aaron Becker
 *
 * NOTES:
 * This is the base class from which all other tasks are descended.
 *
 * This provides the basic run, update, and draw loop, and defers to
 * subclass methods to actually implement behavior.
 *
 * To make a new task, you extend this via  * setupGoals, setupRobots, setupProps, and evaluateCompletion functions.
_.extend() and override the
 *
 * USAGE:
 * var mytask = new myTask(); // assume myTask extends baseTask
 * mytask.init( { $canvas: $("#canvas") } );    // assume #canvas is where to draw
 *
 */

 function open_close(){
    var txt = $("button.open_one").text();
    if(txt === "read more"){                  
        $("p.less").removeClass("less").addClass("more");
        $("button.open_one").text("close");                            
    }
    else
    {
        $("p.more").removeClass("more").addClass("less");
        $("button.open_one").text("read more");
    }  
  }


var baseTask = {
    taskName: "base task",
    taskMode: "",
    shownNotice: false,
    instructions: "Default instructions.",
    theScience: "Default Science.",

    firstKeyPressed : false,
    isTaskComplete : false,
    keyL: null,
    keyR: null,
    keyU: null,
    keyD: null,
    // check for colorblind issues: http://colorfilter.wickline.org/
    // http://staff.rice.edu/Template_RiceBrand.aspx?id=4718
    colorRobot: "blue",
    colorRobotEdge: "rgb(50,50,255)", //"blue" == rgb(0,0,255)
    colorRobotGoal: "blue", //"rgb(0,36,106)" Rice Blue is too dark "blue",
    colorRobotAtGoal: "lightblue",
    colorObstacle: "rgb(95,96,98)",// Rice Gray. //"black", //"red", //red = 255,0,0
    colorGoalArrow: "rgb(0,110,0)",
    colorGoal: "green", //"rgb(88,178,88)",  // color of unclocked button (middle) "green",
    colorObject: "green", //  "rgb(80,163,80)",  // color of clicked button,  "green" = 0,128,0,
    colorObjectEdge: "darkgreen", //"rgb(60,123,60)",  // color of clicked button border "darkgreen",
    colorObjectAtGoal: "lightgreen", //"rgb(97,197,97)",  //"lightgreen",
    strokeWidth: 2,
    strokeWidthThick: 4,  
    obsThick: 1/5, //thickness of obstacles at edges and internally
    TaskTotalNum: 5, //how many tasks?
    TaskNum: 0, //this tasks' number


    /*
     * Function to setup the task.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    setupTask: function( options ) {
    },

    /*
     * Function to setup the boundary walls
     
    setupBoundary: function( options, bodyDef, fixDef,that){
      console.log("in setupBoundary");
        // reshape fixture def to be horizontal bar
        fixDef.shape.SetAsBox(10, that.obsThick);

        // create bottom wall
        bodyDef.position.Set(10, 20-that.obsThick);
        that._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create top wall
        bodyDef.position.Set(10, that.obsThick);
        that._world.CreateBody(bodyDef).CreateFixture(fixDef);
 
        // reshape fixture def to be vertical bar
        fixDef.shape.SetAsBox(that.obsThick, 10);
        
        // create left wall
        bodyDef.position.Set(that.obsThick, 10);
        that._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create right wall
        bodyDef.position.Set(20-that.obsThick, 10);
        that._world.CreateBody(bodyDef).CreateFixture(fixDef);
    },*/

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
        //$("#task-instructions").append(  this.instructions  );

        // add science to the page
        $("#task-theScience").empty();
        $("#task-theScience").append( $( "<h4>The Science</h4><p>" 
            + this.theScience //+ '<p> <div class="slide" style="cursor: pointer; text-align:center"><a href>  More &#8661; Less</a></div>'
            ) );

        // add the task mode
        if( this.taskMode != "default"){
            $("#taskMode").empty();
            $("#taskMode").append( $( "<strong>Mode: </strong><span>" + this.taskMode + "</span>") );
        }


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

        // render the task time
    	string = "<strong>Time:</strong> " + (this._runtime).toFixed(2) + "s";
        $('#taskFeedback').html(string);
        // check to see if we've reached completion.
        if ( this.isTaskComplete == false && this.evaluateCompletion( this._options ) ) {
            // if so, post our results to the server.
            $.ajax( { type: "POST",
                      url: "/result",
                      dataType: "json",
                      async: false,
                      data: { task:this.taskName, mode:this.taskMode, runtime:this._runtime, numrobots:this._numrobots, participant:"web"}
            });
            this.isTaskComplete = true;
            // draw seethrough grey box
            drawutils.drawRect(300,300, 590,590, "white");//rgba(200, 200, 200, 0.8)");
            var color = "green";
            //drawutils.drawText(300,250, "Task completed in "+ (this._runtime).toFixed(2) +" seconds!", 2, color, color)
            // at this point, we do not reschedule, and the task ends.

            //TODO: 1. display plot in a colorbox
            //TODO: 2. display buttons for Play Again, all results, task list
            //TODO: 3. display: "you have completed x of 4 tasks.  Play again!" <or> "Level cleared -- you may play again to increase your score"
            $.get("/result.json?task="+this.taskName, function( data ) {
                var data = JSON.parse(data);
                //console.log(data);
                var c = $(".canvas");
                swarmcontrol.results.singlePlot(c,data.results);
            });
            //Problem: button shows up above the plot.  Why?
            $("#canvasID").empty();
            $("#canvasID").append( $( '<button id="-play-again-button" class="btn btn-success" onClick="window.location.reload()">Play Again</button>') );
            //<div class="task-buttons">
            //  <button id="-play-again-button" class="btn btn-success" onClick="window.location.reload()">Play Again</button>
            //  <button id="-show_results-button" class="btn btn-success" onClick="parent.location='../show_results'">Show Results</button>
            //  <button id="-tasks-button" class="btn btn-success" onClick="parent.location='../'">Tasks</button>
            //</div>


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

