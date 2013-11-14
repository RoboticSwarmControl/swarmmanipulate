




var baseController = (function(){
    this.useKeyboard = false;  //true if user uses keyboard to control
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
            if( e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 38 || e.keyCode == 40 
                || e.keyCode == 65 || e.keyCode == 68 || e.keyCode == 87 || e.keyCode == 83)
            {that.useKeyboard = true;}

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


        //if (window.DeviceOrientationEvent) { // mobile devices with accelerometers can tilt the device to move robots.  So can some laptops
            window.addEventListener('deviceorientation', function(event) {
                var yval = -event.beta;  // In degree in the range [-180,180]
                var xval = -event.gamma; // In degree in the range [-90,90]

                if( !that.useKeyboard ){
                    //property may change. A value of 0 means portrait view, 
                    if( window.orientation == -90)
                    {   //-90 means a the device is landscape rotated to the right,
                        yval = event.gamma;
                        xval = event.beta; 
                    }else if( window.orientation == 90)
                    {   //and 90 means the device is landscape rotated to the left.
                        xval = event.gamma;
                        xval =-event.beta; 
                    }
                     
                    // simple control that maps tilt to keypad values.
                    var thresh = 10;
                    that.lastUserInteraction = new Date().getTime();
         
                    if( yval > thresh )
                    {   
                        that.keyD=null;
                        if(that.keyU==null){that.keyU = that.lastUserInteraction;} 
                    }else if ( yval < -thresh )
                    {   
                        that.keyU=null;
                        if(that.keyD==null){that.keyD = that.lastUserInteraction;} 
                    }else
                    {that.keyD=null; that.keyU=null;}

                    if( xval > thresh )
                    {   
                        that.keyR=null;
                        if(that.keyL==null){that.keyL = that.lastUserInteraction;} 
                    }else if ( xval < -thresh )
                    {   
                        that.keyL=null;
                        if(that.keyR==null){that.keyR = that.lastUserInteraction;} 
                    }else
                    {that.keyR=null; that.keyL=null;}
                
                    //check if this is the first valid keypress, if so, starts the timer
                    if( that._startTime == null && ( that.keyL != null || that.keyR != null || that.keyU != null || that.keyD != null))
                    { 
                        that._startTime = that.lastUserInteraction;
                        that._runtime = 0.0;
                    }
                }
            });
        //}


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
