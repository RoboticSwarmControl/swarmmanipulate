var mazePositioningTask = _.extend({}, baseTask, baseController, {
    taskName: "maze_positioning",
    taskMode: "default",
    instructions: "",
    theScience: ' Transport of goods and materials between points is at the heart of all engineering and construction in real-world systems. '
    +' This experiment varies the number of robots used to transport an object.'
    +' <p> We keep the total area, maximum robot speed, and sum force the swarm can produce constant.'
    +' See <a href="http://www.youtube.com/watch?v=px5RdSvGD2Q"> our video of robots pushing a model piano</a>, or '
    +' <a href="https://sites.google.com/site/aabecker/Becker2013b.pdf">our paper</a>  for details.'
    + '<iframe width="270" height="295" src="//www.youtube.com/embed/px5RdSvGD2Q" frameborder="0" allowfullscreen></iframe> '
    +"</p>",

    _numrobots: Math.floor((Math.random()*500)+1),                                           // number of robots
    _robotRadius: 0.5,
    _robots: [],                                            // array of bodies representing the robots
    _blocks: [],                                            // array of bodies representing workpieces
    _goals: [],                                             // array of goals where blocks should go
    _impulse: 20,                                            // impulse to move robots by
    _impulseV: new phys.vec2(0,0),                          // global impulse to control all robots
    _world: new phys.world( new phys.vec2(0, 00), true ),   // physics world to contain sim
    _zeroReferencePoint: new phys.vec2(0,0),                // cached reference point for impulse application

    setupTask: function( options ) {
        // fixture definition for obstacles
        var fixDef = new phys.fixtureDef;
        fixDef.density = 10.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value

        // body definition for obstacles
        var bodyDef = new phys.bodyDef;
        bodyDef.userData = 'obstacle';
        bodyDef.type = phys.body.b2_staticBody;

        //create ground obstacles
        fixDef.shape = new phys.polyShape;

        // reshape fixture def to be horizontal bar
        fixDef.shape.SetAsBox(10, this.obsThick);
        
        // create bottom wall
        bodyDef.position.Set(10, 20-this.obsThick);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create top wall
        bodyDef.position.Set(10, this.obsThick);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // reshape fixture def to be vertical bar
        fixDef.shape.SetAsBox(this.obsThick, 10);
        
        // create left wall
        bodyDef.position.Set(this.obsThick, 10);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create right wall
        bodyDef.position.Set(20-this.obsThick, 10);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // reshape fixture def to be horizontal bar
        fixDef.shape.SetAsBox(20, this.obsThick);

        // create mid lower wall
        bodyDef.position.Set(25, 6.66);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);
        
        // create mid upper wall
        bodyDef.position.Set(-5, 13.33);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);
        


        // create block
        // This defines a hexagon in CCW order.
        // http://blog.sethladd.com/2011/09/box2d-and-polygons-for-javascript.html
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = "workpiece";
        bodyDef.position.Set(10,16.5);
        fixDef.isSensor = false;
        var Mpoints = [ 
        {x: 1, y: 0}, 
        {x: 1/2, y: Math.sqrt(3)/2}, 
        {x: -1/2, y:Math.sqrt(3)/2},
        {x: -1, y:0}, 
        {x: -1/2, y: -Math.sqrt(3)/2}, 
        {x: 1/2, y:-Math.sqrt(3)/2}];
        var points = [];
        var SCALE = 2;
        for (var i = 0; i < Mpoints.length; i++) {
            var vec = new phys.vec2();
            vec.Set(SCALE*Mpoints[i].x, SCALE*Mpoints[i].y);
            points.push(vec);
        }
        fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape();
        fixDef.shape.SetAsArray(points, points.length);
        
        this._blocks.push( this._world.CreateBody(bodyDef));
        fixDef.density = 1.0;
        this._blocks[0].CreateFixture(fixDef);
        this._blocks[0].m_angularDamping = 5;
        this._blocks[0].m_linearDamping = 5;

        // create the goal
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = "goal";
        bodyDef.position.Set(17,3.35);
        this._goals.push( this._world.CreateBody(bodyDef) );
        fixDef.isSensor = true;
        //fixDef.shape = new phys.polyShape;
        //fixDef.shape.SetAsBox(3,2.9);
        fixDef.shape = new phys.circleShape(3); 
        this._goals[0].CreateFixture(fixDef);

        // create some robots
        this.instructions = "Using " + this._numrobots + " robots (blue), " + " move an object (green) to the goal area (outlined) using the arrow keys (&#8592;,&#8593;,&#8595;,&#8594;)";
        if(this.mobileUserAgent){
            this.instructions = "Using " + this._numrobots + " robots (blue), " + " move an object (green) to the goal area (outlined) by tilting your screen (&#8592;,&#8593;,&#8595;,&#8594;)";
        }
        this._robotRadius = 0.5*4.0/Math.sqrt(this._numrobots);
        var rowLength = Math.floor(7/(2*this._robotRadius));
        var xoffset = this._robotRadius+0.5;
        var yoffset = 14+this._robotRadius;
        this._robots = [];
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = 'robot';
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value
        fixDef.isSensor = false;
        fixDef.shape = new phys.circleShape( this._robotRadius ); // radius .5 robots
        for(var i = 0; i < this._numrobots; ++i) {
            bodyDef.position.x = (i%rowLength)*2.1*this._robotRadius + xoffset;
            bodyDef.position.y = Math.floor(i/rowLength)*2.1*this._robotRadius + yoffset;
            this._robots[i] = this._world.CreateBody(bodyDef);
            this._robots[i].CreateFixture(fixDef);
            this._robots[i].m_angularDamping = 10;
            this._robots[i].m_linearDamping = 10;  //should these be proportional to robot mass?
            //TODO: add units
        }
    },

    
    evaluateCompletion: function( options ) {
        var ret = true;
        // need to check if object has been moved into the goal zone
        var that = this;
        _.each(that._blocks, function (b) {
            // we use _.every because it will stop iterating on success
            _.every(that._goals, function (g) {
                ret = g.GetFixtureList().GetAABB().Contains( b.GetFixtureList().GetAABB() );
                return !ret;
            });
        });
        
        return ret;
    },

    draw: function() {
        drawutils.clearCanvas();
        var that = this;
        var colorGoal;

        // draw goal zone
        _.each(that._goals, function (g) { 
            var f = g.GetFixtureList();
            var radius = f.GetShape().GetRadius();
            var pos = g.GetPosition();
            drawutils.drawCircle( 30*pos.x, 30*pos.y,30*radius, that.colorGoal, that.strokeWidth );
        });

        //draw robots and obstacles
        for (b = this._world.GetBodyList() ; b; b = b.GetNext())
        {
            var angle = b.GetAngle()*(180/Math.PI);
            for(f = b.GetFixtureList(); f; f = f.GetNext()) {
                if (b.GetUserData() == 'goal') {
                    continue; // we drew the goal earlier
                }
                if (b.GetUserData() == 'robot') {
                    // draw the robots
                    var radius = f.GetShape().GetRadius();
                    var pos = b.GetPosition();
                    drawutils.drawRobot( 30*pos.x, 30*pos.y,angle, 30*radius, that.colorRobot,that.colorRobotEdge); 
                } else if (b.GetUserData() == 'workpiece') {
                    // draw the pushable object
                    var X = f.GetShape().GetVertices()[1].x - f.GetShape().GetVertices()[0].x; 
                    var Y = f.GetShape().GetVertices()[2].y - f.GetShape().GetVertices()[1].y;
                    var pos = b.GetPosition();
                    var color = that.colorObject;
                    //drawutils.drawRect(30*pos.x, 30*pos.y, 30* X, 30 * Y, color,angle);
                    drawutils.drawPolygon(30*pos.x, 30*pos.y,30*2,6,angle,color);
                } else {
                    //http://calebevans.me/projects/jcanvas/docs/polygons/
                    // draw the obstacles
                    var X = f.GetShape().GetVertices()[1].x - f.GetShape().GetVertices()[0].x; 
                    var Y = f.GetShape().GetVertices()[2].y - f.GetShape().GetVertices()[1].y;
                    var pos = b.GetPosition();
                    var color = that.colorGoal;
                    if(b.GetUserData() == 'obstacle') {
                        color = that.colorObstacle;
                    }
                    drawutils.drawRect(30*pos.x, 30*pos.y, 30* X, 30 * Y, color);
                }
            }
        }

        // draw goal zone
        _.each(that._goals, function (g) { 
            var pos = g.GetPosition();
            color = that.colorGoal;
            drawutils.drawText(30*pos.x,30*pos.y,"Goal", 1.5, color, color)
        });
        // draw text before game starts
        if(that._startTime == null){
            var color = 'white';

            //draw arrow from object to goal
            var pGoalArrow = [[400,495],[525,495],[525,300],[80,300],[80,100],[400,100]];
            drawutils.drawLine(pGoalArrow,that.colorGoal,false,50,true);
            var aY = 20;
            var aX = 50;
            var pGoalArrow = [[400-aX,100+aY],[400,100],[400-aX,100-aY]];
            drawutils.drawLine(pGoalArrow,that.colorGoal,false,50,false);
            // (←,↑,↓,→)
            if(that.mobileUserAgent){
                  drawutils.drawText(300,300,"tilt screen to move object to goal", 1.5, 'white', 'white');
            }else{drawutils.drawText(300,300,"move object to goal with arrow keys", 1.5, 'white', 'white');}

            _.each(that._blocks, function (g) { 
                var pos = g.GetPosition();
                color = 'white';
                drawutils.drawText(30*pos.x,30*pos.y,"Object", 1.5, color, color)
            });

            _.each(that._blocks, function (g) { 
                var pos = g.GetPosition();
                color = 'white';
                drawutils.drawText(30*pos.x,30*pos.y,"Object", 1.5, color, color)
            });

            var meanx = 0;
            var meany = 0;
            for(var i = 0; i < this._numrobots; ++i) {
                var pos = this._robots[i].GetPosition();
                meanx = meanx + pos.x/this._numrobots;
                meany = meany + pos.y/this._numrobots;
            }
            var color = that.colorRobot;
            drawutils.drawRect(30*meanx,30*(meany+2), 120,30, "rgba(240, 240, 240, 0.7)");
            drawutils.drawText(30*meanx,30*(meany+2),this._numrobots+" Robots", 1.5, color, color);
        }


    },

    // update function run every frame to update our robots
    update: function() {
        var that = this;
    	var maxImpTime = .2; //seconds to maximum impulse
        that._impulseV.x = 0;
        that._impulseV.y = 0;
        var dateNow = new Date().getTime();

        if(that.keyL!=null){that._impulseV.x -= that._impulse*Math.min(1, .001*(dateNow-that.keyL)/maxImpTime);} 
        if(that.keyR!=null){that._impulseV.x += that._impulse*Math.min(1, .001*(dateNow-that.keyR)/maxImpTime);} 
        if(that.keyU!=null){that._impulseV.y -= that._impulse*Math.min(1, .001*(dateNow-that.keyU)/maxImpTime);} 
        if(that.keyD!=null){that._impulseV.y += that._impulse*Math.min(1, .001*(dateNow-that.keyD)/maxImpTime);} 

        // moving at diagonal is no faster than moving sideways or up/down
        var normalizer = Math.min(1,that._impulse/Math.sqrt(that._impulseV.x*that._impulseV.x + that._impulseV.y*that._impulseV.y));
        var forceScaler = normalizer*(that._robotRadius*0.5)/0.25;   
        //scale by robot size -- now scale by robot diameter (500 robots was SLOW).  These means we hose the first 26 results (bummer)
        that._impulseV.x *=  forceScaler;    
        that._impulseV.y *=  forceScaler;  
        // apply the user force to all the robots
        _.each( that._robots, function(r) { 
            r.ApplyForce( that._impulseV, r.GetWorldPoint( that._zeroReferencePoint ) );
        } );
        // step the world, and then remove all pending forces
        this._world.Step(1 / 60, 10, 10);
        this._world.ClearForces(); // TODO: was this a hack?  NO, we need it
    },
});

// this makes sure that the "this" context is properly set
for (var m in mazePositioningTask) {
    if (typeof mazePositioningTask[m] == "function") {
        mazePositioningTask[m] = _.bind( mazePositioningTask[m], mazePositioningTask );
    }
}

// register our task with the application
app.registerTask( mazePositioningTask );
