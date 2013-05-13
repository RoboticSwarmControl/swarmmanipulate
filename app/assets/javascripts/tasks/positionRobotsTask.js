var positionRobotsTask = _.extend({}, baseTask, {
    taskName: "robot_positioning",

    setupGoals: function( goals, options ) {
    },

    setupRobots: function( robots, options ) {
    },

    setupStaticProps: function( staticProps, options ) {
    },

    setupDynamicProps: function( dynamicProps, options ) {
    },
    
    setupController: function (robots, options) {
    },

    evaluateCompletion: function( goals, props, robots) {
        return false;
    },

    draw: function() {
    },

    update: function() {
    },
});

app.registerTask( positionRobotsTask );
