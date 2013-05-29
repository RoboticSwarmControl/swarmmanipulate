var pyramidBuildingTask = _.extend({}, baseTask, {
    taskName: "pyramid_building",
    instructions: "Move the robots (blue) to the goals (green) using the arrow keys (&#8592;,&#8593;,&#8595;,&#8594;)",

    _numrobots: 8,                                          // number of robots
    _robots: [],                                            // array of bodies representing the robots
    _blocks: [],                                            // array of bodies representing blocks
    _goals: [],                                             // array of goals of form {x,y,w,h}
    _impulse: 1,                                            // impulse to move robots by
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

        // create middle wall
        fixDef.shape.SetAsBox( 4, .2);
        bodyDef.position.Set(10, 10);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);
 
        // reshape fixture def to be vertical bar
        fixDef.shape.SetAsBox(.2, 14);
        
        // create left wall
        bodyDef.position.Set(0, 13);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create right wall
        bodyDef.position.Set(20, 13);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        // create pyramid blocks
        this._blocks = [];
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = 'workpiece';
        fixDef.shape = new phys.polyShape();
        fixDef.shape.SetAsBox( .5,.5);
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value
        for(var i = 0; i < 6; ++i) {
            bodyDef.position.x = 4.5 + 2*i;
            bodyDef.position.y = 15;
            this._blocks[i] = this._world.CreateBody(bodyDef);
            this._blocks[i].CreateFixture(fixDef);
            this._blocks[i].m_angularDamping = 1;
            this._blocks[i].m_linearDamping = 1;
        }

        // create some robots
        var xoffset = 8;
        var yoffset = 4;
        this._robots = [];
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = 'robot';
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value
        fixDef.shape = new phys.circleShape( 0.5 ); // radius .5 robots
        for(var i = 0; i < this._numrobots; ++i) {
            bodyDef.position.x = (i%4)*1.2 + xoffset;
            bodyDef.position.y = 1.2*Math.floor( i/4 ) + yoffset;
            this._robots[i] = this._world.CreateBody(bodyDef);
            this._robots[i].CreateFixture(fixDef);
            this._robots[i].m_angularDamping = 1;
            this._robots[i].m_linearDamping = 1;
        }

        // create goals
        var goalPositions = [ {x:10.0, y:7.2},
                              {x:9.5, y:8.2}, {x:10.5, y:8.2},
                              {x:9, y:9.2}, {x:10.0,y:9.2}, {x:11,y:9.2}];
        fixDef.isSensor = true;
        fixDef.shape = new phys.polyShape;
        fixDef.shape.SetAsBox(.2,.2);
        bodyDef.type = phys.body.b2_dynamicBody;
        bodyDef.userData = "goal";
        var that = this;
        _.each(goalPositions, function (gp) {
            var body;
            bodyDef.position.Set(gp.x,gp.y);
            body = that._world.CreateBody(bodyDef);
            body.CreateFixture(fixDef);
            that._goals.push(body);
            console.log(body);
        });
    },

    setupController: function ( options ) {
        var that = this;
        /* setup key listeners */
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
    },

    evaluateCompletion: function( options ) {
        var ret = true;
        // need to check if object has been moved into the goal zone
        var that = this;
        var blockupied = 0;
        // for each goal, see if it contains a block
        _.each(that._blocks, function (b) {
            var blockAABB = b.GetFixtureList().GetAABB();
            _.every(that._goals, function (g) {
                ret = blockAABB.Contains( g.GetFixtureList().GetAABB() );
                if (ret) {
                    blockupied++;
                }
                return !ret;
            });
        });
       
        return blockupied == this._goals.length;
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
                    continue;
                }
                if (b.GetUserData() == 'robot') {
                    // draw the robots
                    var radius = f.GetShape().GetRadius();
                    var pos = b.GetPosition();
                    drawutils.drawRobot( 30*pos.x, 30*pos.y,angle, 30*radius, "blue","blue"); 
                } else if (b.GetUserData() == 'workpiece') {
                    // draw the obstacles
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
for (var m in pyramidBuildingTask) {
    if (typeof pyramidBuildingTask[m] == "function") {
        pyramidBuildingTask[m] = _.bind( pyramidBuildingTask[m], pyramidBuildingTask );
    }
}

// register our task with the application
app.registerTask( pyramidBuildingTask );
