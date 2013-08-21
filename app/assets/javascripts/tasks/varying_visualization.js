var varyingVisualizationTask = _.extend({}, baseTask, baseController, {
    taskName: "varying_visualization",
    taskMode: "default",
    instructions: "try out four different visualization methods for controlling a swarm.",
    theScience: 'Sensing is expensive, especially on the nanoscale.  To see nanocars, scientist fasten molecules that fluoresce light when activated by a strong lamp of a particular color.' 
    +' Unfortunately, multiple exposures can destroy these molecules, a process called <a href="http://en.wikipedia.org/wiki/Photobleaching">photobleaching</a>.'
    +' What happens if we use less power for the exposure?  This experiment varyies the amount of sensing information given to explore the impact on manipulation. '
    +' Full-state sensing is the most information, because it tells the position of all the robots (200 numbers for 100 robots).  The bounding box draws a line around the outermost robots. '
    +' Mean tells where the average position (just 2 numbers for all 100 robots), and knowing the variance adds 3 additional numbers.'
    +'<iframe width="270" height="295"  src="//www.youtube.com/embed/qIW6hPgqCRE" frameborder="0" allowfullscreen></iframe>',
    //full-state (visualize all robots)
    //convex hull of robots
    //mean & standard deviation of group
    //only mean of group


    _numrobots: 100, //Math.floor((Math.random()*500)+1),           // number of robots
    _robotRadius: 0.5,
    _robots: [],                                            // array of bodies representing the robots
    _blocks: [],                                            // array of bodies representing workpieces
    _goals: [],                                             // array of goals where blocks should go
    _impulse: 40,                                            // impulse to move robots by
    _impulseV: new phys.vec2(0,0),                          // global impulse to control all robots
    _world: new phys.world( new phys.vec2(0, 00), true ),   // physics world to contain sim
    _zeroReferencePoint: new phys.vec2(0,0),                // cached reference point for impulse application

    _taskModes: new Array("full-state", "convex-hull", "mean & variance", "mean"),
    setupTask: function( options ) {  
        // randomly assign mode
        this.taskMode = this._taskModes[Math.floor(Math.random()*this._taskModes.length)];


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
        this.instructions = "Using the arrow keys (&#8592;,&#8593;,&#8595;,&#8594;) to move " + this._numrobots + " robots (blue), " + this.instructions + " Current mode displays the <strong>" + this.taskMode + "</strong>.  Please play all " +this._taskModes.length+ " visualization modes.";
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
            //random position
            bodyDef.position.x = xoffset + 7*Math.random();
            bodyDef.position.y = yoffset +5*Math.random();
            //place robots in orderly lines
            //bodyDef.position.x = (i%rowLength)*2.1*this._robotRadius + xoffset;
            //bodyDef.position.y = Math.floor(i/rowLength)*2.1*this._robotRadius + yoffset;
            this._robots[i] = this._world.CreateBody(bodyDef);
            this._robots[i].CreateFixture(fixDef);
            this._robots[i].m_angularDamping = 10;
            this._robots[i].m_linearDamping = 10;
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
                    //var verts = f.GetShape().GetVertices();
                    //var X = verts[1].x - verts[0].x; 
                    //var Y = verts[2].y - verts[1].y;
                    //var pos = g.GetPosition();
                    //var color = that.colorGoal;
                    //drawutils.drawEmptyRect(30*pos.x, 30*pos.y, 30* X, 30 * Y, color);

                    var radius = f.GetShape().GetRadius();
                    var pos = g.GetPosition();
                    drawutils.drawCircle( 30*pos.x, 30*pos.y,30*radius, that.colorGoal, that.strokeWidth);
                   // drawCircle = function (x,y,radius,color,strokeWidth) 
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
                    continue; // we draw the robots elsewhere
                    //var radius = f.GetShape().GetRadius();
                    //var pos = b.GetPosition();
                    //drawutils.drawRobot( 30*pos.x, 30*pos.y,angle, 30*radius, "blue","blue"); 
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

        var tempTaskMode = this.taskMode;
        if(that._startTime == null){
            tempTaskMode = this._taskModes[Math.round(new Date().getTime()/2500)%this._taskModes.length];
        }

        switch (tempTaskMode) {
            //var taskModes=new Array("full-state", "convex-hull", "mean & variance", "mean");
            case "full-state":

                 for(var i = 0; i < this._numrobots; ++i) {
                    var radius = this._robots[i].m_fixtureList.m_shape.m_radius;
                    var pos = this._robots[i].GetPosition();
                    drawutils.drawRobot( 30*pos.x, 30*pos.y,angle, 30*radius, that.colorRobot,that.colorRobot); 
                }
                break;
            
            case "convex-hull":
                var points = [];
                for(var i = 0; i < this._numrobots; ++i) {
                    var pos = this._robots[i].GetPosition();
                    points.push([30*pos.x,30*pos.y]);
                }
                var cHull = drawutils.getConvexHull(points);
                var cHullPts = [];
                for(var i = 0; i < cHull.length; ++i) {
                    cHullPts.push([cHull[i][0][0],cHull[i][0][1]]);
                }

                drawutils.drawLine(cHullPts,"lightblue",true,4,false);
                break;
            case "mean & variance":
            // http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance
            // t95% confidence ellipse
                var meanx = 0;
                var meany = 0;
                var varx = 0;
                var vary = 0;
                var covxy = 0;
                for(var i = 0; i < this._numrobots; ++i) {
                    var pos = this._robots[i].GetPosition();
                     meanx = meanx + pos.x/this._numrobots;
                     meany = meany + pos.y/this._numrobots;
                }
                for(var i = 0; i < this._numrobots; ++i) {
                    var pos = this._robots[i].GetPosition();
                     varx =  varx + (pos.x-meanx)*(pos.x-meanx)/this._numrobots;
                     vary =  vary + (pos.y-meany)*(pos.y-meany)/this._numrobots;
                     covxy=  covxy+ (pos.x-meanx)*(pos.y-meany)/this._numrobots;
                }
                var diffeq = Math.sqrt( (varx-vary)*(varx-vary)/4 + covxy*covxy);
                var varxp = (varx+vary)/2 + diffeq;
                var varyp = (varx+vary)/2 - diffeq;
                var angle = 180/Math.PI*1/2*Math.atan2( 2*covxy, varx-vary);


                drawutils.drawRobot( 30*meanx, 30*meany,0, 15, "lightblue",that.colorRobot);
                drawutils.drawEllipse( 30*meanx, 30*meany,2.4*30*Math.sqrt(varxp), 2.4*30*Math.sqrt(varyp),angle,"lightblue",4 );

            break;
            case "mean":
                var meanx = 0;
                var meany = 0;
                 for(var i = 0; i < this._numrobots; ++i) {
                    var pos = this._robots[i].GetPosition();
                     meanx = meanx + pos.x/this._numrobots;
                     meany = meany + pos.y/this._numrobots;
                }
                drawutils.drawRobot( 30*meanx, 30*meany,0, 15, "lightblue",that.colorRobot);
            break;
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
            drawutils.drawLine(pGoalArrow,that.colorGoalArrow,false,50,true);
            var aY = 20;
            var aX = 50;
            var pGoalArrow = [[400-aX,100+aY],[400,100],[400-aX,100-aY]];
            drawutils.drawLine(pGoalArrow,that.colorGoalArrow,false,50,false);
            // (←,↑,↓,→)
            drawutils.drawText(300,300,"move object to goal with arrow keys", 1.5, 'white', 'white')

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
            drawutils.drawRect(30*meanx,30*(meany+1), 120,30, "rgba(240, 240, 240, 0.7)");
            drawutils.drawText(30*meanx,30*(meany+1),this._numrobots+" Robots", 1.5, color, color)
            var color = 'black';
            drawutils.drawRect(30*meanx,30*(meany+2), 120,30, "rgba(240, 240, 240, 0.7)");
            drawutils.drawText(30*meanx,30*(meany+2),tempTaskMode, 1.5, color, color)
        }
    },


    // update function run every frame to update our robots
    update: function() {
        var that = this;
        var maxImpTime = 2.0; //seconds to maximum impulse
        that._impulseV.x = 0;
        that._impulseV.y = 0;
        var dateNow = new Date().getTime();
 
        if(that.keyL!=null){that._impulseV.x -= that._impulse*Math.min(1, .001*(dateNow-that.keyL)/maxImpTime);} 
        if(that.keyR!=null){that._impulseV.x += that._impulse*Math.min(1, .001*(dateNow-that.keyR)/maxImpTime);} 
        if(that.keyU!=null){that._impulseV.y -= that._impulse*Math.min(1, .001*(dateNow-that.keyU)/maxImpTime);} 
        if(that.keyD!=null){that._impulseV.y += that._impulse*Math.min(1, .001*(dateNow-that.keyD)/maxImpTime);} 


        // moving at diagonal is no faster than moving sideways or up/down
        var normalizer = Math.min(1,that._impulse/Math.sqrt(that._impulseV.x*that._impulseV.x + that._impulseV.y*that._impulseV.y));
        var forceScaler = normalizer*(that._robotRadius*that._robotRadius)/0.25;   //scale by robot size
        that._impulseV.x *=  forceScaler;    
        that._impulseV.y *=  forceScaler;   
        // apply the user force to all the robots
        var brownianImpulse = new phys.vec2(0,0); 
        var mag = 0;
        var ang = 0;
        _.each( that._robots, function(r) { 
            //apply Brownian noise
            mag = 5*Math.random();
            ang = 2*Math.PI*Math.random();
            brownianImpulse.x = mag*Math.cos(ang) + that._impulseV.x ;
            brownianImpulse.y = mag*Math.sin(ang) + that._impulseV.y ;
            r.ApplyForce( brownianImpulse, r.GetWorldPoint( that._zeroReferencePoint ) );
            // no noise
            //r.ApplyForce( that._impulseV, r.GetWorldPoint( that._zeroReferencePoint ) );
        } );

        // step the world, and then remove all pending forces
        this._world.Step(1 / 60, 10, 10);
        this._world.ClearForces();
    },

});

// this makes sure that the "this" context is properly set
for (var m in varyingVisualizationTask) {
    if (typeof varyingVisualizationTask[m] == "function") {
        varyingVisualizationTask[m] = _.bind( varyingVisualizationTask[m], varyingVisualizationTask );
    }
}

// register our task with the application
app.registerTask( varyingVisualizationTask );
