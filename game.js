/**
 * Created by Ante Dante on 5/27/2016.
 */
var Physics = require('./node_modules/physicsjs/dist/physicsjs-full.min');


var viewWidth = 1;
var viewHeight = 1;

console.log('game start');

var world = Physics();

Physics(function( world ){

    var topLeftCorner = Physics.body('circle', {
        x: 0,
        y: 0,
        radius: 0.1
    });

    var topRightCorner = Physics.body('circle', {
        x: 1,
        y: 0,
        radius: 0.1
    });

    var bottomLeftCorner = Physics.body('circle', {
        x: 0,
        y: 1,
        radius: 0.1
    });

    var bottomRightCorner = Physics.body('circle', {
        x: 1,
        y: 1,
        radius: 0.1
    });

    world.add(topLeftCorner);
    world.add(topRightCorner);
    world.add(bottomLeftCorner);
    world.add(bottomRightCorner);

    var playerTop = Physics.body('circle', {
        x: 0.5,
        y: -0.05,
        radius: 0.1
    });

    var playerLeft = Physics.body('circle', {
        x: -0.05,
        y: 0.5,
        radius: 0.1
    });

    var playerRight = Physics.body('circle', {
        x: 1.05,
        y: 0.5,
        radius: 0.1
    });

    var playerBottom = Physics.body('circle', {
        x: 0.5,
        y: 1.05,
        radius: 0.1
    });

    world.add(playerTop);
    world.add(playerLeft);
    world.add(playerBottom);
    world.add(playerRight);

    //test ball
    var ball = Physics.body('circle', {
        x: 0.5,
        y: 0.5,
        radius: 0.05,
        vx: 0.01,
        vy: 0.01
    });

    world.add(ball);

    // time


    Physics.util.ticker.on(function( time){
        console.log('here');
        world.step( time );
    });

    world.on('step', function(){
        console.log('making a step');
        //console.log(ball)

    });

    Physics.util.ticker.now();
    Physics.util.ticker.start();


    world.step(world.time);
    world.step(world.time);
    world.step(world.time);
    console.log('is running:' + Physics.util.ticker.isActive());

    Physics.util.ticker.now();
    Physics.util.ticker.start();

});
Physics.util.ticker.start();



