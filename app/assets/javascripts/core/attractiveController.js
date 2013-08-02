var attractiveController = (function(){
    /*
     * Function to setup controller method.
     * This should be overridden by the user as needed.
     * @param options -- object of options that might be important
     */
    var setupController = function ( options ) {
        var that = this;
      
        /* setup mouse listener */
        $("#canvas").on( "mousemove", function(e){

            console.log(e.clientX + " " + e.clientY);

        } , false );        

    };

    return { setupAttractiveController : setupController };
})();
