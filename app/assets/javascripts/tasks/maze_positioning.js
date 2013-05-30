var mazePositioningTask = _.extend({}, baseTask, {
    taskName: "maze_positioning",
    instructions: "use the robots (blue) to move an object (green) to the goal area (orange) using the arrow keys (&#8592;,&#8593;,&#8595;,&#8594;)",

    _numrobots: 8,                                          // number of robots
    _robots: [],                                            // array of bodies representing the robots
    _blocks: [],                                            // array of bodies representing workpieces
    _goals: [],                                             // array of goals where blocks should go
    _impulse: 2,                                            // impulse to move robots by
    _impulseV: new phys.vec2(0,0),                          // global impulse to control all robots
    _world: new phys.world( new phys.vec2(0, 00), true ),   // physics world to contain sim
    _zeroReferencePoint: new phys.vec2(0,0),                // cached reference point for impulse application

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
        fixDef.shape.SetAsBox(20, .22);

        // create bottom wall
        bodyDef.position.Set(10, 20);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create top wall
        bodyDef.position.Set(10, 0);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create mid lower wall
        bodyDef.position.Set(25, 6.66);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);
        
        // create mid upper wall
        bodyDef.position.Set(-5, 13.33);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);
 
        // reshape fixture def to be vertical bar
        fixDef.shape.SetAsBox(.2, 14);
        
        // create left wall
        bodyDef.position.Set(0, 13);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create right wall
        bodyDef.position.Set(20, 13);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create block
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = "workpiece";
        bodyDef.position.Set(10,16.5);
        fixDef.isSensor = false;
        fixDef.shape.SetAsBox(0.5,0.5);
        this._blocks.push( this._world.CreateBody(bodyDef));
        this._blocks[0].CreateFixture(fixDef);

        // create the goal
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = "goal";
        bodyDef.position.Set(17,3.35);
        this._goals.push( this._world.CreateBody(bodyDef) );
        fixDef.isSensor = true;
        fixDef.shape = new phys.polyShape;
        fixDef.shape.SetAsBox(3,2.9);
        this._goals[0].CreateFixture(fixDef);

        // create some robots
        var xoffset = 2;
        var yoffset = 16;
        this._robots = [];
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = 'robot';
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value
        fixDef.isSensor = false;
        fixDef.shape = new phys.circleShape( 0.5 ); // radius .5 robots
        for(var i = 0; i < this._numrobots; ++i) {
            bodyDef.position.x = (i%4) + xoffset;
            bodyDef.position.y = Math.floor(i/4) + yoffset;
            this._robots[i] = this._world.CreateBody(bodyDef);
            this._robots[i].CreateFixture(fixDef);
            this._robots[i].m_angularDamping = 1;
            this._robots[i].m_linearDamping = 1;
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
                    var verts = f.GetShape().GetVertices();
                    var X = verts[1].x - verts[0].x; 
                    var Y = verts[2].y - verts[1].y;
                    var pos = g.GetPosition();
                    var color = 'orange';
                    drawutils.drawEmptyRect(30*pos.x, 30*pos.y, 30* X, 30 * Y, color);
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
                    drawutils.drawRobot( 30*pos.x, 30*pos.y,angle, 30*radius, "blue","blue"); 
                } else if (b.GetUserData() == 'workpiece') {
                    // draw the pushable object
                    var X = f.GetShape().GetVertices()[1].x - f.GetShape().GetVertices()[0].x; 
                    var Y = f.GetShape().GetVertices()[2].y - f.GetShape().GetVertices()[1].y;
                    var pos = b.GetPosition();
                    var color = 'green';
                    drawutils.drawRect(30*pos.x, 30*pos.y, 30* X, 30 * Y, color,angle);

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
        // apply the user force to all the robots
        _.each( that._robots, function(r) { 
            r.ApplyForce( that._impulseV, r.GetWorldPoint( that._zeroReferencePoint ) );
        } );

        // step the world, and then remove all pending forces
        this._world.Step(1 / 60, 10, 10);
        this._world.ClearForces();
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
