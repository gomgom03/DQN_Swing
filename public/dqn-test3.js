let env1 = {};
env1.getNumStates = function () { return 6; }
env1.getMaxNumActions = function () { return 360; }
let env2 = {};
env2.getNumStates = function () { return 7; }
env2.getMaxNumActions = function () { return 360; }
// create the DQN agent
let spec1 = { alpha: 0.01, epsilon: 0.4 } // see full options on DQN page
agent1 = new RL.DQNAgent(env1, spec1);
let spec2 = { alpha: 0.01, epsilon: 0.4 } // see full options on DQN page
agent2 = new RL.DQNAgent(env2, spec2);

setInterval(function () { // start the learning loop
    let action1 = agent1.act([getTopAng(), getBotAng(), getBallX(), getBallY(), getTargetX(), getTargetY()]); // s is an array of length 8
    let action2 = agent2.act([getTopAng(), getBotAng(), getBallX(), getBallY(), getTargetX(), getTargetY(), action1]);
    setTopAngVel(action1);
    setBotAngVel(action2);
    let topAward = targetCheck();
    let botAward = botLearn();
    console.log(`top: ${topAward}, bot: ${botAward}`)
    agent1.learn(topAward); // the agent improves its Q,policy,model, etc. reward is a float
    agent2.learn(botAward);


}, 1000);