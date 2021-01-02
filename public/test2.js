const Engine = Matter.Engine,
    Events = Matter.Events,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector;

let sizeX = 2000,
    sizeY = 2000,
    releaseT = 50

let engine = Engine.create(),
    world = engine.world;

world.gravity.scale = 0.00//3;

let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 900,
        height: 900,
        wireframes: false,
        background: '#2b2b2b'
    }
});

Render.run(render);

let runner = Runner.create();
Runner.run(runner, engine);

let group = Body.nextGroup(true),
    armLength = sizeX / 4,
    armWidth = sizeX / 64,
    armX = sizeX / 2,
    armY = sizeY / 2,
    padFactor = 0.475,
    angleTop = Math.PI * 0.5,
    angleBot = Math.PI * 0.5,
    areaRadius = padFactor * 4 * armLength,
    ballRadius = sizeX / 2 - areaRadius,
    target,
    changeSpeed = 0.01,
    changeAngle = Math.PI / 360;

let topArm = Bodies.rectangle(armX + padFactor * armLength, armY, armLength, armWidth, {
    collisionFilter: { group: group },
    frictionAir: 0,
    chamfer: sizeX / 8,
    render: {
        strokeStyle: '#ffffff',
        fillStyle: 'transparent',
        lineWidth: 3
    }
})

let botArm = Bodies.rectangle(armX + padFactor * 3 * armLength, armY, armLength, armWidth, {
    collisionFilter: { group: group },
    frictionAir: 0,
    chamfer: sizeX / 8,
    render: {
        strokeStyle: '#ffffff',
        fillStyle: 'transparent',
        lineWidth: 3
    }
})

Body.rotate(topArm, angleTop, {
    x: armX,
    y: armY
});
Body.rotate(botArm, angleBot, {
    x: armX + padFactor * 2 * armLength,
    y: armY
});
Body.translate(botArm, { x: padFactor * 2 * armLength * (Math.cos(angleTop) - 1), y: Math.sin(angleTop) * padFactor * 2 * armLength })

let totSystem = Composite.create();
Composite.add(totSystem, [topArm, botArm])


Composite.add(totSystem, Constraint.create({
    bodyB: totSystem.bodies[0],
    pointB: { x: -Math.cos(angleTop) * armLength * padFactor, y: -Math.sin(angleTop) * armLength * padFactor },
    pointA: { x: armX, y: armY },
    stiffness: 0.9,
    length: 0,
    render: {
        strokeStyle: '#d1d1d1'
    }
}));

Composite.add(totSystem, Constraint.create({
    bodyA: totSystem.bodies[0],
    bodyB: totSystem.bodies[1],
    pointA: { x: Math.cos(angleTop) * armLength * padFactor, y: Math.sin(angleTop) * armLength * padFactor },
    pointB: { x: -Math.cos(angleBot) * armLength * padFactor, y: -Math.sin(angleBot) * armLength * padFactor },
    stiffness: 0.9,
    length: 0,
    render: {
        strokeStyle: '#d1d1d1'
    }
}));

let ball = Bodies.circle(botArm.position.x + Math.cos(angleBot) * armLength * padFactor, botArm.position.y + Math.sin(angleBot) * armLength * padFactor, ballRadius, {
    collisionFilter: { group: group },
    frictionAir: 0,
    render: {
        fillStyle: '#00ffee',
        lineWidth: 1
    }
})

Composite.add(totSystem, ball);

Composite.add(totSystem, Constraint.create({
    bodyA: totSystem.bodies[1],
    bodyB: totSystem.bodies[2],
    pointA: { x: Math.cos(angleBot) * armLength * padFactor, y: Math.sin(angleBot) * armLength * padFactor },
    pointB: { x: 0, y: 0 },
    stiffness: 0.9,
    length: 0,
    render: {
        strokeStyle: '#d1d1d1'
    }
}));


World.add(world, totSystem);



let trail = [];

Events.on(render, 'afterRender', function () {
    trail.unshift(Vector.clone(ball.position));

    Render.startViewTransform(render);
    let { context } = render;
    context.globalAlpha = 0.7;

    for (var i = 0; i < trail.length; i += 1) {
        var point = trail[i];
        context.fillStyle = '#cffffc';
        context.fillRect(point.x, point.y, 2, 2);
    }

    if (trail.length > 1000) {
        trail.pop();
    }

    context.strokeStyle = '#ff0000'
    context.beginPath();
    context.setLineDash([20, 20]);
    context.moveTo(target.x, target.y);
    context.lineTo(ball.position.x, ball.position.y);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = '#33ff00'
    context.beginPath();
    context.arc(target.x, target.y, 10, 0, 2 * Math.PI);
    context.fill();

    render.context.globalAlpha = 1;
    Render.endViewTransform(render);

});

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene

Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: sizeX, y: sizeY }
});

function getTopAng() { return reduceAngle(topArm.angle) }
function getBotAng() { return reduceAngle(botArm.angle) }
function getTopAngVel() { return topArm.angularVelocity }
function getBotAngVel() { return botArm.angularVelocity }
function getBallX() { return ball.position.x }
function getBallY() { return ball.position.y }
function getTargetX() { return target.x }
function getTargetY() { return target.y }
function setTopAngVel(choice) {
    let tVel = topArm.angularVelocity;
    switch (choice) {
        case 2: tVel = 0; break;
        case 1: Body.rotate(topArm, changeAngle, { x: sizeX / 2, y: sizeY / 2 }); break;
        case 0: Body.rotate(topArm, -changeAngle, { x: sizeX / 2, y: sizeY / 2 });
    }
    stopBodies();
}
function setBotAngVel(choice) {
    let tVel = botArm.angularVelocity;
    switch (choice) {
        case 2: tVel = 0; break;
        case 1: Body.rotate(botArm, changeAngle, { x: sizeY / 2 + 2 * padFactor * armLength * Math.cos(topArm.angle), y: sizeY / 2 + 2 * padFactor * armLength * Math.sin(topArm.angle) }); break;
        case 0: Body.rotate(botArm, -changeAngle, { x: sizeY / 2 + 2 * padFactor * armLength * Math.cos(topArm.angle), y: sizeY / 2 + 2 * padFactor * armLength * Math.sin(topArm.angle) });
    }
    stopBodies();
}

function reduceAngle(ang) {
    let rt = Math.atan(Math.tan(ang)),
        m360 = ang % (2 * Math.PI),
        m180 = ang % (Math.PI);
    if ((m360 < Math.PI && m180 > Math.PI / 2) || (m360 < -Math.PI && m180 > -Math.PI / 2)) {
        rt += Math.PI;
    } else if ((m360 > Math.PI && m180 < Math.PI / 2) || (m360 > -Math.PI && m180 < -Math.PI / 2)) {
        rt -= Math.PI;
    }
    return rt;
}

function createTarget() {
    let tempX, tempY
    do {
        tempX = sizeX * Math.random();
        tempY = sizeY * Math.random();
    } while (Math.hypot(tempX - sizeX / 2, tempY - sizeY / 2) > sizeY / 2)
    target = { x: tempX, y: tempY }
}
createTarget();
//setInterval(createTarget, 20000)
/*
function targetCheck() {
    let tDist = distCheck(ball.position.x, ball.position.y, target.x, target.y);
    let sampleDist = distCheck(sizeX / 2, sizeY / 2, target.x, target.y)
    if (tDist < ballRadius) {
        createTarget();
    }
    return 1 - tDist / sampleDist;
}

function botLearn() {
    let tDist = distCheck(ball.position.x, ball.position.y, target.x, target.y);
    let sampleDist = distCheck(target.x, target.y, sizeY / 2 + 2 * padFactor * armLength * Math.cos(topArm.angle), sizeY / 2 + 2 * padFactor * armLength * Math.sin(topArm.angle))
    console.log(`this: ${sampleDist}`)
    return 1 - tDist / sampleDist;
}
*/
let rewardTop = 0, rewardBot = 0
function targetCheck() {
    let tDist = distCheck(ball.position.x, ball.position.y, target.x, target.y);
    let sampleDist = distCheck(sizeX / 2, sizeY / 2, target.x, target.y)
    if (tDist < ballRadius) {
        createTarget();
        return 1
    }
    return 1 - tDist / sampleDist;
}

function botLearn() {
    let tDist = distCheck(ball.position.x, ball.position.y, target.x, target.y);
    let sampleDist = distCheck(target.x, target.y, sizeY / 2 + 2 * padFactor * armLength * Math.cos(topArm.angle), sizeY / 2 + 2 * padFactor * armLength * Math.sin(topArm.angle))
    return 1 - tDist / sampleDist;
}

function distCheck(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2)
}

function stopBodies() {
    totSystem.bodies.forEach(x => {
        Body.setAngularVelocity(x, 0);
        Body.setVelocity(x, { x: 0, y: 0 });
    })
}
/*
setTimeout(() => {
    world.gravity.scale = 0.001
    Body.setAngularVelocity(totSystem.bodies[0], angVelTop);
    Body.setAngularVelocity(totSystem.bodies[1], angVelBot);
    setTimeout(() => { Composite.remove(totSystem, totSystem.constraints[2]) }, releaseT)
}, 1000)
*/