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
                that.lastUserInteraction = new Date().getTime();
                that._startTime = that.lastUserInteraction;
                that._runtime = 0.0;
            }
        });

        $("#canvas").mouseup( function (e) {
            that.lastUserInteraction = new Date().getTime();
            that._repulsing = false;
        });

                /* setup touch listener */
        $("#canvas")[0].addEventListener('touchmove', function(e){
            e.preventDefault();
            var rect = this.getBoundingClientRect();
            var touch = e.touches[0];
            var left = touch.pageX - rect.left - this.clientLeft + this.scrollLeft;
            var top = touch.pageY - rect.top - this.clientTop + this.scrollTop ;

            that._mX = 20 * left/this.width;
            that._mY = 20 * top/this.height+ 10;
        },false);        

        $("#canvas")[0].addEventListener('touchstart', function(e) {
            that._repulsing = true;
            //check if this is the first valid keypress, if so, starts the timer
            if( that._startTime == null )
            { 
                that.lastUserInteraction = new Date().getTime();
                that._startTime = that.lastUserInteraction;
                that._runtime = 0.0;
            }
        },false);

        $("#canvas")[0].addEventListener('touchend', function (e) {
            that.lastUserInteraction = new Date().getTime();
            that._repulsing = false;
        },false);

    };

    var repulsiveUpdate = function () {
        var that = this;
        // apply the user force to all the robots
        if (that._repulsing) {
            that.lastUserInteraction = new Date().getTime();
            _.each( that._robots, function(r) { 
                var rpos = r.GetPosition();             
                var dx = that._mX - rpos.x;
                var dy = that._mY - rpos.y;
                var distSq = dx*dx + dy*dy;
                var mag = Math.sqrt(distSq);
                var h2 = 4;
                var forceM = 100*distSq/Math.pow(distSq + h2,2);
                //that._impulseV.x = 20*dx/Math.pow(mag,1) || 0;
                that._impulseV.x = -20*dx/mag*forceM || 0;
                that._impulseV.y = -20*dy/mag*forceM || 0;
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
