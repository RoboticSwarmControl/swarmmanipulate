/**
   SImplifies Canvas drawing operations.
   
   TODO: have drawRobot function.
   
    Extract the draw stuff from massive_manipulation.js into drawutils.js . Ideally we want to be able to call something as simple as drawutils.drawCircle( x, y, radius, color) instead of the current pile of canvas code. This is hugely useful.
   
*/

var drawutils = (function(){
    var drawCircle = function (x,y,radius,color) {
	    context.strokeStyle = color; 
	    context.beginPath();
	    // TODO: what is this *30 value?
            context.arc(x*30,y*30,radius*30,0,2*Math.PI);
            context.stroke();
    };

    var drawRect = function (x,y,w,h,color) {
    };
    
    return { drawCircle : drawCircle,
             drawRect : drawRect       
    };
})();
