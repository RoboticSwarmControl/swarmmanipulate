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
