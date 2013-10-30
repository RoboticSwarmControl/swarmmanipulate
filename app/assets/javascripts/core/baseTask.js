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
 * To make a new task, you extend this via  _.extend() and override the setupGoals, setupRobots, setupProps, and evaluateCompletion functions.
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
var ar=new Array(33,34,35,36,37,38,39,40);

$(document).keydown(function(e) {
     var key = e.which;
      if($.inArray(key,ar) > -1) {
          e.preventDefault();
          return false;
      }
      return true;
});

var baseTask = {
    taskName: "base task",
    taskMode: "",
    shownNotice: false,
    instructions: "Default instructions.",
    theScience: "Default Science.",

    firstKeyPressed : false,
    isTaskComplete : false,
    lastUserInteraction : null,
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
     * Function to setup the instructions for the task.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    setupInstructions: function( options ) {
        $("#task-instructions").empty();
        $("#task-instructions").append( $( "<h4>How to play</h4><p>" + this.instructions + "<p>") );
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
        this.setupInstructions( this._options );

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

        // TODO: catch users leaving
        
        // do the loop
        requestAnimFrame( this._update );
    },

    /*
     * Function to run the simulation.
     * This generally SHOULD NOT be overridden.
     */
    _doingRestart: false,
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

        //see if user walked away
        var sSinceLastUserInteration = ( new Date().getTime() - this.lastUserInteraction )/1000.0;
        if (this._startTime != null &&  sSinceLastUserInteration > 10){
            drawutils.drawRect(300,300, 590,590, 'rgba(200, 200, 200, 0.5)');
            var color = "green";
            drawutils.drawText(300,250, "Are you still there?  ", 2, color, color);
            var sToRestart = ( 15 - sSinceLastUserInteration).toFixed(0);
            drawutils.drawText(300,290, "Restarting in "+ sToRestart +" seconds.", 2, color, color);
            if (sToRestart <= 0)
            { 
                drawutils.drawText(300,330, "Reloading...", 2, color, color);
                if (! this._doingRestart) {
                location.reload(true); //doesn't work
                this._doingRestart = true;
                }
             
            }
        }

        // check to see if we've reached completion.
        if ( this.isTaskComplete == false && this.evaluateCompletion( this._options ) ) {
            //congratulate
            drawutils.drawRect(300,300, 590,590, 'rgba(200, 200, 200, 0.5)');
            var color = "green";
            drawutils.drawText(300,250, "You finished in "+ (this._runtime).toFixed(2) +" seconds!", 2, color, color)
            drawutils.drawText(300,350, "Loading results page...", 2, color, color)
            //TODO: FORCE A REDRAW HERE
            // $('canvas').drawLayer(0); // still a lot of lag, but we saw the screen underneath

            //$('canvas').drawLayers(); //didn't seem to work -- erased background
 
            // next, post our results to the server.
            $.ajax( { type: "POST",
                      url: "/result",
                      dataType: "json",
                      async: false,
                      data: { task:this.taskName, mode:this.taskMode, runtime:this._runtime, numrobots:this._numrobots, participant:"web", agent: navigator.userAgent, aborted:false}
            });
            this.isTaskComplete = true;
            
            // 1. display plot in a colorbox
            // 2. display buttons for Play Again, all results, task list
            // 3. display: "you have completed x of 4 tasks.  Play again!" <or> "Level cleared -- you may play again to increase your score"
            var currTaskName = this.taskName;

            var c = $(".canvas");
            $.get("/result.json?task="+currTaskName, function( data ) {
                var data = JSON.parse(data);
                //console.log(data);
                // draw white  box to to give a background for plot
                drawutils.drawRect(300,300, 590,590, "white");//rgba(200, 200, 200, 0.8)");
                // at this point, we do not reschedule, and the task ends.

                numMyResults = swarmcontrol.results.singlePlot(c,data.results);
                $(".span8").append('<button class="btn btn-success play-again-button" style="position: relative; left: 100px; top: -110px;" onclick="location.reload(true);"><h3>Play again!</h3></button>');
            function drawMeritBadges(divname,numMyResults){
                var numPres = 0;
                numPres = numMyResults;

                    var element=  document.getElementById(divname);
                    var maxstars = 5;
                    var imgsize = "25";
                    if(numPres>5){ 
                        strImage = "/assets/soft_edge_yellow_star.png"
                        $(".span8").append('<img src= '+strImage+' width='+imgsize+' height='+imgsize+' style="position: relative; left: 120px; top: -110px;"><h3 style="position: relative; left: 145px; top: -175px;">x'+numPres+'</h3>');
                    
                    }else{
                    //if(numPres>10){ maxstars = 25;}
                    //if(numPres>25){ maxstars = numPres; imgsize = 15;}
                    for( var i = 0; i<maxstars; i++){
                        var strImage = "/assets/soft_edge_empty_star.png";
                        if( numPres >i) {strImage = "/assets/soft_edge_yellow_star.png";}

                        $(".span8").append('<img src= '+strImage+' width='+imgsize+' height='+imgsize+' style="position: relative; left: 120px; top: -110px;">');
                    
                        }
                    }      
            } 
        
            drawMeritBadges("canvasID",numMyResults);
            var k =_.keys(swarmcontrol.prettyTaskNames);
            var nextTask = k.indexOf(currTaskName) + 1;
            if(nextTask >= k.length){nextTask = 0;}
            newTaskPath = "parent.location='./" + k[nextTask] + "'";
            console.log(newTaskPath);

            $(".span8").append('<button class="btn btn-success next-Task-button" style="position: relative; left: 140px; top: -110px;" onclick='+newTaskPath+'>► Next Task</button>');

            });

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

