const socket = io();
socket.on('dqnuploadresponse', data => {
    console.log(data);
    agent1 = data;
})

let trial = 0;
let tTop = 0;
let tBot = 0;

let env1 = {};
env1.getNumStates = function () { return 8; }
env1.getMaxNumActions = function () { return 2; }
let env2 = {};
env2.getNumStates = function () { return 9; }
env2.getMaxNumActions = function () { return 2; }
// create the DQN agent
let spec1 = { alpha: 0.01, epsilon: 0.7 } // see full options on DQN page
agent1 = new RL.DQNAgent(env1, spec1);
let spec2 = { alpha: 0.01, epsilon: 0.7 } // see full options on DQN page
agent2 = new RL.DQNAgent(env2, spec2);

setInterval(function () { // start the learning loop
    let action1 = agent1.act([getTopAng(), getBotAng(), getTopAngVel(), getBotAngVel(), getBallX(), getBallY(), getTargetX(), getTargetY()]); // s is an array of length 8
    let action2 = agent2.act([getTopAng(), getBotAng(), getTopAngVel(), getBotAngVel(), getBallX(), getBallY(), getTargetX(), getTargetY(), action1]);
    setTopAngVel(action1);
    setBotAngVel(action2);
    let topAward = targetCheck();
    let botAward = botLearn();
    tTop += topAward;
    tBot += botAward;
    if (topAward === 1) {
        scatterChart.data.datasets[0].data.push({ x: trial, y: 1 })
        scatterChart.data.datasets[1].data.push({ x: trial, y: 1 })
        scatterChart.update()
    } else if (trial % 60000 == 0) {
        scatterChart.data.datasets[0].data.push({ x: trial, y: tTop / 60000 })
        scatterChart.data.datasets[1].data.push({ x: trial, y: tBot / 60000 })
        scatterChart.update()
        tTop = 0;
        tBot = 0;
    }
    trial++;


    //console.log(topAward)

    agent1.learn(topAward); // the agent improves its Q,policy,model, etc. reward is a float
    agent2.learn(botAward);

}, 0);

let botClr = generateColor(),
    botClrD = darkenColor(botClr),
    topClr = generateColor(),
    topClrD = darkenColor(topClr)

let ctx = document.getElementById('myChart').getContext('2d');
let scatterChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: `Top Arm`,
            borderColor: topClr,
            backgroundColor: 'transparent',
            data: []
        },
        {
            label: `Bottom Arm`,
            borderColor: botClr,
            backgroundColor: 'transparent',
            data: []
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom',
                scaleLabel: {
                    display: true,
                    labelString: 'Time (Minutes)'
                }
            }],
            yAxes: [{
                type: 'linear',
                position: 'bottom',
                scaleLabel: {
                    display: true,
                    labelString: ''
                }
            }]
        }
    }
});

function generateColor() {
    return '#' + (Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0');
}

function darkenColor(clr) {
    let temp = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(clr);
    let rClr = parseInt(temp[1], 16)
    let gClr = parseInt(temp[2], 16)
    let bClr = parseInt(temp[3], 16)
    function partHexDark(part) {
        let hex = (Math.round(part * 0.5)).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    function makeHex(r, g, b) {
        return "#" + partHexDark(r) + partHexDark(g) + partHexDark(b);
    }
    return makeHex(rClr, gClr, bClr);
}