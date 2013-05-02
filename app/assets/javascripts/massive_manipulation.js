/*
 * massive_manipulation.js -- Massive robot manipulation demo
 * Copyright 2013 Aaron Becker, Chris Ertel
 *
 * TODO:
 * + Post running time to server upon completion of objectives
 * + Start robots at same initial positions.
 */

var app = (function () {

    // Setup some sweet, sweet type abbreviations
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2AABB = Box2D.Collision.b2AABB;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2World = Box2D.Dynamics.b2World;
    var b2MassData = Box2D.Collision.Shapes.b2MassData;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    var b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;
    var impulse = 1.0;
    var impulseV= new b2Vec2(0,0);
	  
    var world = new b2World( new b2Vec2(0, 00), //gravity  setting to zero removes gravity
                             true );            //allow sleep
    var timeStart = null;
    var timeFinish = null;
    
    var context;
    var $canvas = null;
    var timeStr = "0:00";
     
    //goal positions
//    var myGoalsX = [8,7,9,7,8,9,7,9];
//    var myGoalsY = [6,7,7,8,8,8,9,9];
    var myGoalsX = [8,7,9];
    var myGoalsY = [6,7,7];
    
    
   
    // robots
    var m_Robot = [];
    var numrobots = 8;

    var update = function() {
        // apply the user force to all the robots
        for(var i =0; i<m_Robot.length; i++) {
            m_Robot[i].ApplyForce(impulseV,m_Robot[i].GetWorldPoint(new b2Vec2(0,0)));
        }
       
        world.Step(1 / 60, 10, 10);
        world.ClearForces();
    };
    var animloop = function(){
        update();
        draw();

        if ( checkFinished() == false ) {
            requestAnimFrame(animloop);
        }
	};


    var countRobots = function () {
        var ret = 0;
        for (var i = 0; i<myGoalsX.length; i++) {
            for (var j = 0; j < m_Robot.length; j++) {
                var roboPosition = m_Robot[j].GetPosition();
                if( mathutils.lineDistance( myGoalsX[i],myGoalsY[i],roboPosition.x,roboPosition.y) < 0.5) {
                    ret++;
                }
            }
        }
        return ret;
    };

    var runtime = 0;

    var checkFinished = function() {

        var robotsAtGoal = countRobots();
        var neededRobots = myGoalsX.length;

        if ( robotsAtGoal == neededRobots ) {
            $.ajax( { type:"POST",
                      url: "/result",
                      dataType: "json",
                      async: false,
                      data: {task:"arrange", runtime:runtime, participant:"web"}
            });
            alert("Task complete. Time was "+ runtime + " seconds." );
            return true;
        }

        return false;
    };

    var draw = function () {
        drawutils.clearCanvas();
        
        var countRobotsAtGoal = 0;
	var colorGoal;
        for (var i =0; i<myGoalsX.length; i++) {
            colorGoal = "rgb(0, 255, 0)"; 			
            for (var j = 0; j < numrobots; ++j) {
                var roboPosition = m_Robot[j].GetPosition();
                if( mathutils.lineDistance( myGoalsX[i],myGoalsY[i],roboPosition.x,roboPosition.y) < 0.5) {
                    colorGoal = "rgb(255, 0, 0)"; 
                    countRobotsAtGoal++;
                }
            }
            // draw the goal positions
            // the 30s we see scattered through here are canvas scaling factor -- crertel
	    drawutils.drawCircle(30*myGoalsX[i],30*myGoalsY[i],30*0.5,colorGoal);
        }
        
        
        //draw robots and obstacles
        for (b = world.GetBodyList() ; b; b = b.GetNext())
        {
            var angle = b.GetAngle()*(180/Math.PI);
            for(f = b.GetFixtureList(); f; f = f.GetNext()) {
                if (b.GetUserData() == 'robot') {
                     var radius = f.GetShape().GetRadius();
                     var pos = b.GetPosition();
                     drawutils.drawCircle( 30*pos.x, 30*pos.y, 30*radius, "blue");
                } else {
                    var X = f.GetShape().GetVertices()[1].x - f.GetShape().GetVertices()[0].x; 
                    var Y = f.GetShape().GetVertices()[2].y - f.GetShape().GetVertices()[1].y;
                    var pos = b.GetPosition();
                    var color = 'orange';
                    if(b.GetUserData() == 'obstacle') {
                      color = 'red';
                    } else if(b.GetUserData() == 'rectangleB') {
                      color = 'blue';
                    }

                    drawutils.drawRect(30*pos.x, 30*pos.y, 30* X, 30 * Y, color);
               }
            }
        }

        var day = new Date();
                
        if( timeStart != null) {
            runtime = (day.getTime() - timeStart)/1000;
        }
        string = "Time = "+ runtime +"s<br>Move the robots (blue) to the goals (green) using the arrow keys (&#8592;,&#8593;,&#8595;,&#8594;) or (a,w,s,d).<br><br><strong>"+countRobots()+" at goal</strong>";
        $('#cc').html(string); //USERDATA WILL SHOWN IN "div" WITH ID "cc" 
     }; //end draw
     
    var init = function() {
         drawutils.init();        
	    
         // used for?
         var fixDef = new b2FixtureDef;
         fixDef.density = 1.0;
         fixDef.friction = 0.5;
         fixDef.restitution = 0.2;  //bouncing value
         
         var bodyDef = new b2BodyDef;

         //create ground rectangleA
    	 bodyDef.userData = 'obstacle';
         bodyDef.type = b2Body.b2_staticBody;
         fixDef.shape = new b2PolygonShape;
         fixDef.shape.SetAsBox(20, 2);
         bodyDef.position.Set(10, 600 / 30 + 1.8); //bottom
	    
         var bodyBottom = world.CreateBody(bodyDef);
         bodyBottom.CreateFixture(fixDef);
         bodyDef.position.Set(10, -1.8);
         world.CreateBody(bodyDef).CreateFixture(fixDef);
         fixDef.shape.SetAsBox(2, 14);
         bodyDef.position.Set(-1.8, 13);
         world.CreateBody(bodyDef).CreateFixture(fixDef);
         bodyDef.position.Set(21.8, 13); // right side
         world.CreateBody(bodyDef).CreateFixture(fixDef);

    	 //create an object to move
    	 bodyDef.type = b2Body.b2_staticBody;
	     fixDef.density = 10.0;
         fixDef.friction = 0.5;
         fixDef.restitution = 0.2;  //bouncing value
         bodyDef.position.Set(10,10);
		 bodyDef.userData = 'obstacle';
		 fixDef.shape = new b2PolygonShape;
		 fixDef.shape.SetAsBox(0.5,0.5);
		 var obst = world.CreateBody(bodyDef);
		 obst.CreateFixture(fixDef);
		 obst.m_angularDamping = 0.1;
	     obst.m_linearDamping = 0.1;
         
         //create some robots
    	 bodyDef.type = b2Body.b2_dynamicBody;
	     fixDef.density = 1.0;
         fixDef.friction = 0.5;
         fixDef.restitution = 0.2;  //bouncing value
         for(var i = 0; i < numrobots; ++i) {
            fixDef.shape = new b2CircleShape( 0.5 ); // radius .5 robots
            bodyDef.userData = 'robot';
            bodyDef.position.x = Math.random() * 10;
            bodyDef.position.y = Math.random() * 10;
    	    m_Robot[i] = world.CreateBody(bodyDef);
            m_Robot[i].CreateFixture(fixDef);
	        m_Robot[i].m_angularDamping = 1;
	        m_Robot[i].m_linearDamping = 1;
         }
	
         /* requestAnimationFrame polyfill */
    	 window.requestAnimFrame = ( function() {
    		return  window.requestAnimationFrame || 
    		window.webkitRequestAnimationFrame   || 
    		window.mozRequestAnimationFrame      || 
    		window.oRequestAnimationFrame        || 
	    	window.msRequestAnimationFrame       || 
    		function( callback, element) { window.setTimeout(callback, 1000 / 60);};
	    })();

	  
        /* setup key listeners */
    	document.addEventListener( "keydown", function(e){
            if ( timeStart == null) {
                timeStart = new Date().getTime();
            }
            switch (e.keyCode) {
                case 37 : impulseV.x = -impulse; break;
                case 39 : impulseV.x = impulse; break;
                case 38 : impulseV.y = -impulse; break;
                case 40 : impulseV.y = impulse; break;
                case 65 : impulseV.x = -impulse; break;
                case 68 : impulseV.x = impulse; break;
                case 87 : impulseV.y = -impulse; break;
                case 83 : impulseV.y = impulse; break;
		}} , false );
	    
        document.addEventListener( "keyup", function(e){
	 	    switch (e.keyCode) {
                case 37 : impulseV.x = 0; break;
                case 39 : impulseV.x = 0; break;
                case 38 : impulseV.y = 0; break;
                case 40 : impulseV.y = 0; break;
                case 65 : impulseV.x = 0; break;
                case 68 : impulseV.x = 0; break;
                case 87 : impulseV.y = 0; break;
                case 83 : impulseV.y = 0; break;
		}} , false );
        
        /* setup and start animation loop */
        requestAnimFrame(animloop);
    };
    return { init: init};
})(); 
