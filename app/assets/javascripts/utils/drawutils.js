/**
   SImplifies Canvas drawing operations.
   
   TODO: have drawRobot function.
   
    Extract the draw stuff from massive_manipulation.js into drawutils.js . Ideally we want to be able to call something as simple as drawutils.drawCircle( x, y, radius, color) instead of the current pile of canvas code. This is hugely useful.
   
*/

var drawutils = (function(){
    
    var context = null;
    var $canvas = null;

    var drawCircle = function (x,y,radius,color) {
	    context.strokeStyle = color; 
	    context.beginPath();
	    // TODO: what is this *30 value?
        // 30 appears to be a scaling factor to match the canvas size. -- crertel
        context.arc(x,y,radius,0,2*Math.PI);
        context.stroke();
    };
    
   var drawRobot = function (x,y,theta,radius,colorFill,colorEdge) {
	   
	   $canvas.rotateCanvas({
                          x: pos.x * 30, y: pos.y * 30,
                          rotate: theta
                      }).drawArc({
                          fillStyle: colorFill,						  
                          x: pos.x * 30, y: pos.y * 30,
                          radius: radius * 30
                      }).restoreCanvas();
	   
    };

    var drawRect = function (x,y,w,h,color) {
        $canvas.drawRect({
            fillStyle:color,
            x: x, y: y,
            width: w, height: h, cornerRadius: 0
        });
    };

    var init = function () {
        context = $("#canvas")[0].getContext('2d');
        $canvas = $("#canvas");
    };

    var clearCanvas = function() {
        $canvas.clearCanvas();
    };
    
    return { drawCircle : drawCircle,
             drawRect : drawRect,
             clearCanvas : clearCanvas,
             init : init
    };
})();
