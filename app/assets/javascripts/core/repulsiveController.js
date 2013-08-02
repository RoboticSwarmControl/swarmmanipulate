var repulsiveController = (function(){
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
            that._repulsing = true;
            if( that._startTime == null )
            { 
                that._startTime = new Date().getTime();
                that._runtime = 0.0;
            }
        });

        $("#canvas").mouseup( function (e) {
            that._repulsing = false;
        });
    };

    var repulsiveUpdate = function () {
        var that = this;
        // apply the user force to all the robots
        if (that._repulsing) {
            _.each( that._robots, function(r) { 
                var rpos = r.GetPosition();             
                var dx = that._mX - rpos.x;
                var dy = that._mY - rpos.y;
                var mag = Math.sqrt(dx*dx + dy*dy);

                that._impulseV.x = -10*dx/mag || 0;
                that._impulseV.y = -10*dy/mag || 0;
                r.ApplyForce( that._impulseV, r.GetWorldPoint( that._zeroReferencePoint ) );
            } );
        }

        // step the world, and then remove all pending forces
        this._world.Step(1 / 60, 10, 10);
        this._world.ClearForces();
    };

    return { setupRepulsiveController : setupController,
             repulsiveUpdate : repulsiveUpdate };
})();
