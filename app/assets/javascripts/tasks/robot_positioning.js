var positionRobotsTask = _.extend({}, baseTask, {
    taskName: "robot_positioning",

    _numrobots: 8,
    _robots: [],
    _impulse: 1,
    _impulseV: new phys.vec2(0,0),
    _world: new phys.world( new phys.vec2(0, 00), true ),
    _zeroReferencePoint: new phys.vec2(0,0),
    _myGoalsX: [8,7,9],
    _myGoalsY: [6,7,7],    

    setupTask: function( options ) {
        // used for?
        var fixDef = new phys.fixtureDef;//b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value

        var bodyDef = new phys.bodyDef;

        //create ground rectangleA
        bodyDef.userData = 'obstacle';
        bodyDef.type = phys.body.b2_staticBody;
        fixDef.shape = new phys.polyShape;
        fixDef.shape.SetAsBox(20, 2);
        bodyDef.position.Set(10, 600 / 30 + 1.8); //bottom

        var bodyBottom = this._world.CreateBody(bodyDef);
        bodyBottom.CreateFixture(fixDef);
        bodyDef.position.Set(10, -1.8);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);
        fixDef.shape.SetAsBox(2, 14);
        bodyDef.position.Set(-1.8, 13);
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);
        bodyDef.position.Set(21.8, 13); // right side
        this._world.CreateBody(bodyDef).CreateFixture(fixDef);

        //create an object to move
        bodyDef.type = phys.body.b2_staticBody;
        fixDef.density = 10.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value
        bodyDef.position.Set(10,10);
        bodyDef.userData = 'obstacle';
        fixDef.shape = new phys.polyShape;
        fixDef.shape.SetAsBox(0.5,0.5);
        var obst = this._world.CreateBody(bodyDef);
        obst.CreateFixture(fixDef);
        obst.m_angularDamping = 0.1;
        obst.m_linearDamping = 0.1;

        //create some robots
        this._robots = [];
        bodyDef.type = phys.body.b2_dynamicBody;
        fixDef.density = 1.0;
        fixDef.friction = 0.5;
        fixDef.restitution = 0.2;  //bouncing value
        for(var i = 0; i < this._numrobots; ++i) {
            fixDef.shape = new phys.circleShape( 0.5 ); // radius .5 robots
            bodyDef.userData = 'robot';
            bodyDef.position.x = Math.random() * 10;
            bodyDef.position.y = Math.random() * 10;
            this._robots[i] = this._world.CreateBody(bodyDef);
            this._robots[i].CreateFixture(fixDef);
            this._robots[i].m_angularDamping = 1;
            this._robots[i].m_linearDamping = 1;
        }
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
            }} , false );

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
        var robotsAtGoal = this._countRobots();
        var neededRobots = this._myGoalsX.length;

        return robotsAtGoal == neededRobots;
    },

    draw: function() {
        drawutils.clearCanvas();
        var that = this;
        var countRobotsAtGoal = 0;
        var colorGoal;

        // draw goals 
        for (var i =0; i<this._myGoalsX.length; i++) {
            colorGoal = "rgb(0, 255, 0)"; 			
            _.each( that._robots, function(r) {
                var roboPosition = r.GetPosition();
                if( mathutils.lineDistance( that._myGoalsX[i],that._myGoalsY[i],roboPosition.x,roboPosition.y) < 0.5) {
                    colorGoal = "rgb(255, 0, 0)"; 
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

        string = "Time = " + this._runtime;
        $('#cc').html(string);
    },

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

    _countRobots: function () {
        var ret = 0;
        var that = this;
        for (var i = 0; i<this._myGoalsX.length; i++) {
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

for (var m in positionRobotsTask) {
    if (typeof positionRobotsTask[m] == "function") {
        positionRobotsTask[m] = _.bind( positionRobotsTask[m], positionRobotsTask );
    }
}

app.registerTask( positionRobotsTask );
