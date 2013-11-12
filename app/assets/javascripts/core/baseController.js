
        function tilt(that,yval, xval){
            // simple control that maps tilt to keypad values.
            var thres = 20;
            that.keyL=null;
            that.keyR=null;
            that.keyU=null;
            that.keyD=null;
            that.lastUserInteraction = new Date().getTime();

            if( Math.abs( yval) + Math.abs(xval) > thres)
            {
                if( yval > thresh )
                {that.keyL = that.lastUserInteraction;}
                else if ( yval < -thresh )
                {that.keyR = that.lastUserInteraction;}

                if( xval > thresh )
                {that.keyU = that.lastUserInteraction;}
                else if ( xval < -thresh )
                {that.keyD = that.lastUserInteraction;}
            }
            //check if this is the first valid keypress, if so, starts the timer
            if( that._startTime == null && ( that.keyL != null || that.keyR != null || that.keyU != null || that.keyD != null))
            { 
                that._startTime = that.lastUserInteraction;
                that._runtime = 0.0;
            }
        }



var baseController = (function(){
    /*
     * Function to setup controller method.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    var setupController = function ( options ) {
        var that = this;
        /* setup key listeners */
        document.addEventListener( "keydown", function(e){
            that.lastUserInteraction = new Date().getTime();

            switch (e.keyCode) {
                case 37 : if(that.keyL==null){that.keyL = that.lastUserInteraction;} break; //left
                case 39 : if(that.keyR==null){that.keyR = that.lastUserInteraction;}  break;  //right
                case 38 : if(that.keyU==null){that.keyU = that.lastUserInteraction;}  break; //down
                case 40 : if(that.keyD==null){that.keyD = that.lastUserInteraction;}  break;  //up
                case 65 : if(that.keyL==null){that.keyL = that.lastUserInteraction;}  break;
                case 68 : if(that.keyR==null){that.keyR = that.lastUserInteraction;}  break;
                case 87 : if(that.keyU==null){that.keyU = that.lastUserInteraction;}  break;
                case 83 : if(that.keyD==null){that.keyD = that.lastUserInteraction;}  break;
            }
            //check if this is the first valid keypress, if so, starts the timer
            if( that._startTime == null && ( that.keyL != null || that.keyR != null || that.keyU != null || that.keyD != null))
            { 
                that._startTime = that.lastUserInteraction;
                that._runtime = 0.0;
            }
        } , false );


        if (document.DeviceOrientationEvent) {
            document.addEventListener("deviceorientation", function () {
                tilt(that,[event.beta, event.gamma]);
                //beta is -90 (top down) to +90  (top up), gamma is -90 (left up) to +90 (right up)
            }, true);
        } else if (document.DeviceMotionEvent) {
            document.addEventListener('devicemotion', function () {
                tilt(that,[event.acceleration.x * 2, event.acceleration.y * 2]);
                //https://developer.mozilla.org/en-US/docs/Web/Reference/Events/devicemotion
            }, true);
        } else {
            document.addEventListener("MozOrientation", function () {
                tilt(that,[orientation.x * 50, orientation.y * 50]);
                //The X axis represents the amount of right-to-left tilt. This value is 0 if the device is level along the X axis, and approaches 1 as the device is tilted toward the left, and -1 as the device is tilted toward the right.
                //The Y axis represents the amount of front-to-back tilt. The value is 0 if the device is level along the Y axis, and approaches 1 as you tilt the device backward (away from you) and -1 as you tilt the device frontward (toward you).
            }, true);
        }


        document.addEventListener( "keyup", function(e){
            that.lastUserInteraction = new Date().getTime();
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
    };

    return { setupController : setupController };
})();
