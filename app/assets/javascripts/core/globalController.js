var globalController = (function(){
    /*
     * Function to setup controller method.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    var setupController = function ( options ) {
        var that = this;
      
        /* setup mouse listener */
        $("#canvas").mousemove( function(e){

            /* We need the mouse position in the canvas's coordinate system */
            /* Thanks to Denilson Sa for this:
             * http://stackoverflow.com/questions/6773481/how-to-get-the-mouseevent-coordinates-for-an-element-that-has-css3-transform
             * */
            var rect = this.getBoundingClientRect();
            var left = e.clientX - rect.left - this.clientLeft + this.scrollLeft;
            var top = e.clientY - rect.top - this.clientTop + this.scrollTop;

            that._mX = 20 * left/this.width;
            that._mY = 20 * top/this.height;
        });        

        $("#canvas").mousedown( function(e) {
            that._forcing = true;
            //check if this is the first valid keypress, if so, starts the timer
            if( that._startTime == null )
            { 
                that.lastUserInteraction = new Date().getTime();
                that._startTime = that.lastUserInteraction;
                that._runtime = 0.0;
            }
        });

        $("#canvas").mouseup( function (e) {
            that.lastUserInteraction = new Date().getTime();
            that._forcing = false;
        });
    };

    var globalUpdate = function () {
        var that = this;
        // apply the user force to all the robots
        if (that._forcing) {
        	var angle = Math.atan2(that._mY - 10, that._mX-10);
        	var forcex = Math.cos(angle);
        	var forcey = Math.sin(angle);
            _.each( that._robots, function(r) { 
                
                that._impulseV.x = 40*forcex;
                that._impulseV.y = 40*forcey;
                r.ApplyForce( that._impulseV, r.GetWorldPoint( that._zeroReferencePoint ) );
            } );
        }

        // step the world, and then remove all pending forces
        this._world.Step(1 / 60, 10, 10);
        this._world.ClearForces();
    };

    return { setupGlobalController : setupController,
    			globalUpdate : globalUpdate };
})();
