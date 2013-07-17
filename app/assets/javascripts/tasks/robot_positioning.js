// TODO:  random number of robots (better: let each user name try 1-8 robots)
// TODO:  change color of robots at goal


var positionRobotsTask = _.extend({}, baseTask, {
 taskName: "robot_positioning",
    instructions: "Move the robots (blue) to the goals (green) using the arrow keys (&#8592;,&#8593;,&#8595;,&#8594;)",
    video: "http://www.youtube.com/watch?v=5p_XIad5-Cw",

    _numrobots: Math.floor((Math.random()*10)+1),          // number of robots
    _robots: [],                                            // array of bodies representing the robots
    _impulse: 50,                                            // impulse to move robots by
    _impulseV: new phys.vec2(0,0),                          // global impulse to control all robots
    _world: new phys.world( new phys.vec2(0, 00), true ),   // physics world to contain sim
    _zeroReferencePoint: new phys.vec2(0,0),                // cached reference point for impulse application
    _myGoalsX: [8,7,9,7,8,9,7,9,7,9],                                     // x-coord of goals
    _myGoalsY: [6,7,7,8,8,8,9,9,6,6],                                     // y-coord of goals

    setupTask: function( options ) {
        // fixture definition for obstacles
        var fixDef = new phys.fixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value

        // body definition for obstacles
        var bodyDef = new phys.bodyDef;
        bodyDef.userData = 'obstacle';
        bodyDef.type = phys.body.b2_staticBody;

        //create ground obstacles
        fixDef.shape = new phys.polyShape;

        // reshape fixture def to be horizontal bar
        fixDef.shape.SetAsBox(20, 2);

        // create bottom wall
        bodyDef.position.Set(10, 600 / 30 + 1.8);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create top wall
        bodyDef.position.Set(10, -1.8);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);
 
        // reshape fixture def to be vertical bar
        fixDef.shape.SetAsBox(2, 14);
        
        // create left wall
        bodyDef.position.Set(-1.8, 13);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create right wall
        bodyDef.position.Set(21.8, 13); // right side
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create shaping block
        bodyDef.position.Set(10,10);
        fixDef.shape.SetAsBox(0.5,0.5);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        //create some robots
        this._robots = [];
        this.instructions = "Move the " + this._numrobots + " robots (blue) to the goals (green) using the arrow keys (&#8592;,&#8593;,&#8595;,&#8594;)";
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = 'robot';
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value
        fixDef.shape = new phys.circleShape( 0.5 ); // radius .5 robots
        var rowLength = 3;
        for(var i = 0; i < this._numrobots; ++i) {
            //bodyDef.position.x = Math.random() * 10;
            //bodyDef.position.y = Math.random() * 10;

            bodyDef.position.x = (i%rowLength)*2.1*0.5 + 12;
            bodyDef.position.y = Math.floor(i/rowLength)-2.1*0.5 + 8;
            this._robots[i] = this._world.CreateBody(bodyDef);
            this._robots[i].CreateFixture(fixDef);
            this._robots[i].m_angularDamping = 10;
            this._robots[i].m_linearDamping = 10;
            this._robots[i].atGoal = false;
        }
    },

   /* setupController: function ( options ) {
        var that = this;
        // setup key listeners 
        document.addEventListener( "keydown", function(e){
            switch (e.keyCode) {
                case 37 : that._impulseV.x = -that._impulse; break;
                case 39 : that._impulseV.x = that._impulse; break;
                case 38 : that._impulseV.y = -that._impulse; break;
                case 40 : that._impulseV.y = that._impulse; break;
                case 65 : that._impulseV.x = -that._impulse; break;
                case 68 : that._impulseV.x = that._impulse; break;
                case 87 : that._impulseV.y = -that._impulse; break;
                case 83 : that._impulseV.y = that._impulse; break;
            }
        //check if this is the first keypress -- TODO:  this should be shared code.
	if( that.firstKeyPressed == false && Math.abs(that._impulseV.x) + Math.abs(that._impulseV.y) > 0)
            { 
            that.firstKeyPressed  = true;
            that._startTime = new Date();
            that._runtime = 0.0;
            }
	} , false );

        document.addEventListener( "keyup", function(e){
            switch (e.keyCode) {
                case 37 : that._impulseV.x = 0; break;
                case 39 : that._impulseV.x = 0; break;
                case 38 : that._impulseV.y = 0; break;
                case 40 : that._impulseV.y = 0; break;
                case 65 : that._impulseV.x = 0; break;
                case 68 : that._impulseV.x = 0; break;
                case 87 : that._impulseV.y = 0; break;
                case 83 : that._impulseV.y = 0; break;
            }} , false );
    },*/

    evaluateCompletion: function( options ) {
        var robotsAtGoal = this._countRobots();
        var neededRobots = this._numrobots;

        // we're done if all robots are on the goals
        return robotsAtGoal == neededRobots;
        
    },

    draw: function() {
        drawutils.clearCanvas();
        var that = this;
        var countRobotsAtGoal = 0;
        var colorGoal;
        
        //initialize robots to not be at goal
        _.each( that._robots, function(r) {
                r.atGoal = false;
                });

        // draw goals 
        for (var i =0; i< this._numrobots; i++) { //this._myGoalsX.length
            colorGoal = "rgb(0, 255, 0)"; 			
            _.each( that._robots, function(r) {
                var roboPosition = r.GetPosition();
                if( mathutils.lineDistance( that._myGoalsX[i],that._myGoalsY[i],roboPosition.x,roboPosition.y) < 0.5) {
                    colorGoal = "rgb(255, 0, 0)"; 
                    r.atGoal = true;
                    countRobotsAtGoal++;
                }
            });
            // draw the goal positions
            // the 30s we see scattered through here are canvas scaling factor -- crertel
            drawutils.drawCircle(30*this._myGoalsX[i],30*this._myGoalsY[i],30*0.5,colorGoal);
        }

        //draw robots and obstacles
        for (b = this._world.GetBodyList() ; b; b = b.GetNext())
        {
            var angle = b.GetAngle()*(180/Math.PI);
            for(f = b.GetFixtureList(); f; f = f.GetNext()) {
                if (b.GetUserData() == 'robot') {
                    // draw the robots
                    var radius = f.GetShape().GetRadius();
                    var pos = b.GetPosition();
                    if (b.atGoal == true )
                    {drawutils.drawRobot( 30*pos.x, 30*pos.y,angle, 30*radius, "lightblue","blue"); }
                    else
                    {drawutils.drawRobot( 30*pos.x, 30*pos.y,angle, 30*radius, "blue","blue"); }
                } else {
                    // draw the obstacles
                    var X = f.GetShape().GetVertices()[1].x - f.GetShape().GetVertices()[0].x; 
                    var Y = f.GetShape().GetVertices()[2].y - f.GetShape().GetVertices()[1].y;
                    var pos = b.GetPosition();
                    var color = 'orange';
                    if(b.GetUserData() == 'obstacle') {
                        color = 'red';
                    }
                    drawutils.drawRect(30*pos.x, 30*pos.y, 30* X, 30 * Y, color);
                }
            }
        }
        
    },

    // update function run every frame to update our robots
    update: function() {
        var that = this;
        var maxImpTime = 1.0; //seconds to maximum impulse
        that._impulseV.x = 0;
        that._impulseV.y = 0;
        var dateNow = new Date().getTime();

        if(that.keyL!=null){that._impulseV.x -= that._impulse*Math.min(maxImpTime, (dateNow-that.keyL)/1000.0);} 
        if(that.keyR!=null){that._impulseV.x += that._impulse*Math.min(maxImpTime, (dateNow-that.keyR)/1000.0);} 
        if(that.keyU!=null){that._impulseV.y -= that._impulse*Math.min(maxImpTime, (dateNow-that.keyU)/1000.0);} 
        if(that.keyD!=null){that._impulseV.y += that._impulse*Math.min(maxImpTime, (dateNow-that.keyD)/1000.0);} 


        // apply the user force to all the robots
        _.each( that._robots, function(r) { 
            r.ApplyForce( that._impulseV, r.GetWorldPoint( that._zeroReferencePoint ) );
        } );



        // step the world, and then remove all pending forces
        this._world.Step(1 / 60, 10, 10);
        this._world.ClearForces();
    },

    // function to get the number of robots within distance of a goal
    _countRobots: function () {
        var ret = 0;
        var that = this;
        for (var i = 0; i<this._numrobots; i++) {
            _.each( that._robots, function(r) {
                var roboPosition = r.GetPosition();
                if( mathutils.lineDistance( that._myGoalsX[i], that._myGoalsY[i],roboPosition.x,roboPosition.y) < 0.5) {
                    ret++;
                }
            });
        }
        return ret;
    },
});

// this makes sure that the "this" context is properly set
for (var m in positionRobotsTask) {
    if (typeof positionRobotsTask[m] == "function") {
        positionRobotsTask[m] = _.bind( positionRobotsTask[m], positionRobotsTask );
    }
}

// register our task with the application
app.registerTask( positionRobotsTask );
