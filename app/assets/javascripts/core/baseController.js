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
    };

    return { setupController : setupController };
})();
