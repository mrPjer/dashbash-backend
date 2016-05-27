/**
 * Created by Ante Dante on 5/27/2016.
 */
var Physics = require('./node_modules/physicsjs/dist/physicsjs-full.min');


var viewWidth = 1;
var viewHeight = 1;

console.log('game start');

var world = Physics();



module.exports = function(io) {
    Physics(function( world ){

        var players = {};
        var availablePositions = ['bottom', 'left', 'top', 'right'];

        // set up the world
        var topLeftCorner = Physics.body('circle', {
            x: 0,
            y: 0,
            radius: 0.1,
            treatment: 'static'
        });

        var topRightCorner = Physics.body('circle', {
            x: 1,
            y: 0,
            radius: 0.1,
            treatment: 'static'
        });

        var bottomLeftCorner = Physics.body('circle', {
            x: 0,
            y: 1,
            radius: 0.1,
            treatment: 'static'
        });

        var bottomRightCorner = Physics.body('circle', {
            x: 1,
            y: 1,
            radius: 0.1,
            treatment: 'static'
        });

        world.add(topLeftCorner);
        world.add(topRightCorner);
        world.add(bottomLeftCorner);
        world.add(bottomRightCorner);

        var playerBody = {};
        playerBody['top'] = Physics.body('circle', {
            x: 0.5,
            y: -0.05,
            radius: 0.1,
            treatment: 'static'
        });

        playerBody['left'] = Physics.body('circle', {
            x: -0.05,
            y: 0.5,
            radius: 0.1,
            treatment: 'static'
        });

        playerBody['right'] = Physics.body('circle', {
            x: 1.05,
            y: 0.5,
            radius: 0.1,
            treatment: 'static'
        });

        playerBody['bottom'] = Physics.body('circle', {
            x: 0.5,
            y: 1.05,
            radius: 0.1,
            treatment: 'static'
        });

        world.add(playerBody['top']);
        world.add(playerBody['left']);
        world.add(playerBody['right']);
        world.add(playerBody['bottom']);

        //test ball
        var ball = Physics.body('circle', {
            x: 0.5,
            y: 0.5,
            radius: 0.05,
            vx: 0.0,
            vy: 0.01,
            mass: 1
        });

        world.add(ball);

        // behaviour
        world.add( Physics.behavior('body-impulse-response') );
        world.add( Physics.behavior('body-collision-detection') );
        world.add( Physics.behavior('sweep-prune') );

        // world state
        world.on('step', function(){
            //console.log(ball.state.pos._)
            // broadcast world state
            io.sockets.emit('world state', {
                balls : [ball.state.pos._],
                bottomPlayer: playerBody['bottom'].state.pos._,
                topPlayer: playerBody['top'].state.pos._,
                leftPlayer: playerBody['left'].state.pos._,
                rightPlayer: playerBody['right'].state.pos._});
            // console.log('timestamp: ' + world._time);
            // console.log('BALL         || x: ' + ball.state.pos._[0] + ' y: ' + ball.state.pos._[1]);
            // console.log('TopPlayer    || x: ' + playerBody['top'].state.pos.x + ' y: ' + playerBody['top'].state.pos.y);
            // console.log('BottomPlayer || x: ' + playerBody['bottom'].state.pos.x + ' y: ' + playerBody['bottom'].state.pos.y);
            // console.log('LeftPlayer   || x: ' + playerBody['left'].state.pos.x + ' y: ' + playerBody['left'].state.pos.y);
            // console.log('RightPlayer  || x: ' + playerBody['right'].state.pos.x + ' y: ' + playerBody['right'].state.pos.y);
            // console.log('')

        });


        io.on('connection', function (socket) {
            // new player
            socket.on('newPlayer', function (data) {
                if(availablePositions.length != 0) {
                    players[data['username']] = availablePositions[0];
                    availablePositions.shift();
                    console.log('New Player: ' + data['username'] + ' || Unoccupied positions: ' + availablePositions)
                } else {
                    console.log('Game is full.')
                }
            });
            // player input
            socket.on('movement', function(data) {
                var dx = 0.01;
                var position = players[data['username']];
                var move = data['move'];
                switch (position) {
                    case 'top':
                        if(isAllowedMovement(position, move)) {
                            if(move == 'left')
                                playerBody[position].state.pos.x += dx;
                            if(move == 'right')
                                playerBody[position].state.pos.x -= dx;
                        }
                        break;
                    case 'left':
                        if(isAllowedMovement(position, move)) {
                            if(move == 'left')
                                playerBody[position].state.pos.y -= dx;
                            if(move == 'right')
                                playerBody[position].state.pos.y += dx;
                        }
                        break;
                    case 'right':
                        if(isAllowedMovement(position, move)) {
                            if(move == 'left')
                                playerBody[position].state.pos.y += dx;
                            if(move == 'right')
                                playerBody[position].state.pos.y -= dx;
                        }
                        break;
                    case 'bottom':
                        if(isAllowedMovement(position, move)) {
                            if(move == 'left')
                                playerBody[position].state.pos.x -= dx;
                            if(move == 'right')
                                playerBody[position].state.pos.x += dx;
                        }
                        break;
                }
                //console.log('player: ' + data['username'] + ' movement: ' + move);
                
            });
        });

        function isAllowedMovement(position, move) {
            // TODO
            return true;
        }


        setInterval(function() {
            world.step(world.time)
        }, 1000);

    });

};






