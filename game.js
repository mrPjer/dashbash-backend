/**
 * Created by Ante Dante on 5/27/2016.
 */
var Physics = require('./node_modules/physicsjs/dist/physicsjs-full.min');


var viewWidth = 1;
var viewHeight = 1;
var cornerRadius = 0.166;
var playerRadius = 0.125;

console.log('game start');

var world = Physics();



module.exports = function(io) {
    Physics(function( world ){

        // set up the world
        var framerate = 16;


        var cornerRadius = 0.1;
        var topLeftCorner = Physics.body('circle', {
            x: 0,
            y: 0,
            radius: cornerRadius,
            treatment: 'static'
        });

        var topRightCorner = Physics.body('circle', {
            x: 1,
            y: 0,
            radius: cornerRadius,
            treatment: 'static'
        });

        var bottomLeftCorner = Physics.body('circle', {
            x: 0,
            y: 1,
            radius: cornerRadius,
            treatment: 'static'
        });

        var bottomRightCorner = Physics.body('circle', {
            x: 1,
            y: 1,
            radius: cornerRadius,
            treatment: 'static'
        });

        world.add(topLeftCorner);
        world.add(topRightCorner);
        world.add(bottomLeftCorner);
        world.add(bottomRightCorner);


        var availablePositions = ['bottom', 'left', 'top', 'right'];
        var playerBody = {};
        var players = {};

        playerBody['top'] = Physics.body('circle', {
            x: 0.5,
            y: -0.05,
            radius: playerRadius,
            treatment: 'static'
        });

        playerBody['left'] = Physics.body('circle', {
            x: -0.05,
            y: 0.5,
            radius: playerRadius,
            treatment: 'static'
        });

        playerBody['right'] = Physics.body('circle', {
            x: 1.05,
            y: 0.5,
            radius: playerRadius,
            treatment: 'static'
        });

        playerBody['bottom'] = Physics.body('circle', {
            x: 0.5,
            y: 1.05,
            radius: playerRadius,
            treatment: 'static'
        });

        world.add(playerBody['top']);
        world.add(playerBody['left']);
        world.add(playerBody['right']);
        world.add(playerBody['bottom']);

        // balls constants
        var maxBallsCount = 4;
        var currentBallsCount = 0;
        var ballCreationProbability = 0.1;
        var ballRadius = 0.042;
        var ballMass = 1;
        var ball_id = 0;
        var balls = [];

        function randomInt (low, high) {
            return Math.floor(Math.random() * (high - low) + low);
        }

        function random (low, high) {
            return Math.random() * (high - low) + low;
        }

        // scores
        var startScore = 0;
        var scoreMax = 3;
        var scores = {'top' : startScore, 'bottom' : startScore, 'left' : startScore, 'right' : startScore};

        // behaviour
        world.add( Physics.behavior('body-impulse-response') );
        world.add( Physics.behavior('body-collision-detection') );
        world.add( Physics.behavior('sweep-prune') );

        // world state
        world.on('step', function(){
            console.log(scores);
            // send world state
            io.sockets.emit('world state', {

                balls : balls.map(function (ball) {
                    return ball.state.pos._;
                }),
                bottomPlayer: playerBody['bottom'].state.pos._,
                topPlayer: playerBody['top'].state.pos._,
                leftPlayer: playerBody['left'].state.pos._,
                rightPlayer: playerBody['right'].state.pos._,
                scores: scores});

            // balls logic
            if(currentBallsCount < maxBallsCount) {
                if(Math.random() <= ballCreationProbability) {
                    var newBallPosition = randomInt(0, 3);
                    var ballX, ballY;
                    var ballSpeedX, ballSpeedY;
                    switch(newBallPosition) {
                        case 0:
                            // top left
                            ballX = cornerRadius + ballRadius;
                            ballY = cornerRadius + ballRadius;
                            ballSpeedX = 0.0011;
                            ballSpeedY = 0.0016;
                            break;
                        case 1:
                            // top right
                            ballX = 1 - cornerRadius - ballRadius;
                            ballY = cornerRadius + ballRadius;
                            ballSpeedX = -0.0018;
                            ballSpeedY = 0.0019;
                            break;
                        case 2:
                            // bottom right
                            ballX = 1 - cornerRadius - ballRadius;
                            ballY = 1 - cornerRadius - ballRadius;
                            ballSpeedX = -0.0013;
                            ballSpeedY = -0.0019;
                            break;
                        case 3:
                            // bottom left
                            ballX = cornerRadius - ballRadius;
                            ballY = 1 - cornerRadius - ballRadius;
                            ballSpeedX = 0.0014;
                            ballSpeedY = -0.0012;
                            break;
                    }
                    balls.push(Physics.body('circle', {
                        x: ballX,
                        y: ballY,
                        radius: ballRadius,
                        vx: ballSpeedX,
                        vy: ballSpeedY,
                        mass: ballMass,
                        id: ball_id
                    }));
                    world.add(balls[balls.length-1]);
                    ball_id++;
                    currentBallsCount++;
                }
            }

            // update scores
            for(var i = 0; i < balls.length; i++) {
                if(balls[i].state.pos.x <= 0) {
                    scores['left']++;
                    removeBall(i);
                } else if(balls[i].state.pos.x >= 1) {
                    scores['right']++;
                    removeBall(i);
                } else if(balls[i].state.pos.y <= 0) {
                    scores['top']++;
                    removeBall(i);
                } else if(balls[i].state.pos.y >= 1) {
                    scores['bottom']++;
                    removeBall(i);
                }
            }

            for(var score in scores) {
                if(score >= scoreMax) {
                    scores['top'] = startScore;
                    scores['right'] = startScore;
                    scores['bottom'] = startScore;
                    scores['left'] = startScore;
                    break;
                }
            }
        });

        function removeBall(index) {
            world.remove(balls[index]);
            balls.splice(index,1);
            currentBallsCount--;
        }

        // player interaction
        io.on('connection', function (socket) {
            // new player
            socket.on('newPlayer', function (data) {
                if(availablePositions.length != 0) {
                    players[data['username']] = availablePositions[0];
                    availablePositions.shift();
                    console.log('New Player: ' + data['username'] + ' || Unoccupied positions: ' + availablePositions)
                    socket.emit('positionAssigned', {position : players[data['username']]})
                } else {
                    console.log('Game is full.')
                }
            });
            // player input
            socket.on('movement', function(data) {
                var dx = 0.015;
                var position = players[data['username']];
                var move = data['move'];
					 var newPosition = [
								playerBody[position].state.pos.x,
								playerBody[position].state.pos.y
                ];
                var changedPosition = 0;
                switch (position) {
                    case 'top':
                        if(move == 'left')
                            newPosition[0] += dx;
                        if(move == 'right')
                            newPosition[0] -= dx;
                        changedPosition = 0;
                        break;
                    case 'left':
                        if(move == 'left')
                            newPosition[1] -= dx;
                        if(move == 'right')
                            newPosition[1] += dx;
                        changedPosition = 1;
                        break;
                    case 'right':
                        if(move == 'left')
                            newPosition[1] += dx;
                        if(move == 'right')
                            newPosition[1] -= dx;
                        changedPosition = 1;
                        break;
                    case 'bottom':
                        if(move == 'left')
                            newPosition[0] -= dx;
                            playerBody[position].state.pos.x -= dx;
                        if(move == 'right')
                            newPosition[0] += dx;
                            playerBody[position].state.pos.x += dx;
                        changedPosition = 0;
                        break;
                }
                newPosition[0] = Math.min(1 - cornerRadius - playerRadius, Math.max(cornerRadius + playerRadius, newPosition[0]));
                newPosition[1] = Math.min(1 - cornerRadius - playerRadius, Math.max(cornerRadius + playerRadius, newPosition[1]));

                if(changedPosition == 0) {
                    playerBody[position].state.pos.x = newPosition[0];
                } else {
                    playerBody[position].state.pos.y = newPosition[1];
                }
                //console.log('player: ' + data['username'] + ' movement: ' + move);
                
            });
        });

        setInterval(function() {
            world.step(world.time)
        }, framerate);

    });

};






