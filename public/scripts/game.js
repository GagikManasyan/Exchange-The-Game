const socket = io();


const button = document.getElementById("confirm");
const playerBox = document.getElementsByClassName("player-box");
const roundBox = document.getElementsByClassName("round");
const popUp = document.querySelector('.pop-up');

const players = [];
let currentTurn = 0;

socket.on('updatePlayers',(backendPlayers) => {
  for (let i = 0; i < backendPlayers.length; i++) {
    if (!(players.some(e => e.id === backendPlayers[i].id))) {
      players.push(backendPlayers[i]);
    }
  }
  for (let i = 0; i < players.length; i++) {
    if(players.length !== backendPlayers.length && (!backendPlayers.some((e) => e === players[i]))) {
      players.splice(i,1);
    }
  }
  console.log(players);
})

socket.on("ready", () => {
  start();
});

function start() {
  popUp.style.display = 'block';
  button.addEventListener("click", selectPhases);
  playerBox[0].classList.add("player-active");
  roundBox[0].style.borderBottomColor = "red";
  updatesPlayersInfo();
}

function updatesPlayersInfo() {
  for (let i = 0; i < playerBox.length; i++) {
    let playerNameBar = playerBox[i].querySelector('.name-bar');
    let playerStats = playerBox[i].querySelector('.player-stats');
    let playerProperties = playerBox[i].querySelectorAll('li');
    playerNameBar.querySelector('span').innerText = players[i].name;
    playerStats.querySelector('.player-money').innerText = players[i].money;
    playerProperties[0].querySelector('span').innerText = players[i].red;
    playerProperties[1].querySelector('span').innerText = players[i].green;
    playerProperties[2].querySelector('span').innerText = players[i].blue;
  }
}

socket.on('turn', (turn) => {
  playerBox[currentTurn].classList.remove("player-active");
  currentTurn = turn;
  playerBox[currentTurn].classList.add("player-active");
});

function selectPhases() {
  console.log(socket.id);
  if (socket.id === players[currentTurn].id) {
    console.log('hello');
    let phaseSelect = document.getElementsByClassName("phase");
    let playerPhase = {
      phase1: {
        property:phaseSelect[0].value,
      },
      phase2: {
        action:phaseSelect[1].value,
        amount:phaseSelect[2].value,
      },
      phase3:{
        influencedProperty: phaseSelect[3].value.slice(0,-3),
        influence: phaseSelect[3].value.slice(-2),
      }
    }
    socket.emit('buttonClick',playerPhase);
  }
}

socket.on('adjustMarket',(market) => {
  let coordinateRed = market.red * 10 + 15 - 100;
  let coordinateGreen = market.green * 10 + 15 - 100;
  let coordinateBlue = market.blue * 10 + 15 - 100;
  const redRate = document.querySelector(".red-rate");
  const greenRate = document.querySelector(".green-rate");
  const blueRate = document.querySelector(".blue-rate");
  redRate.style.transform = `translate(${coordinateRed}px)`;
  greenRate.style.transform = `translate(${coordinateGreen}px)`;
  blueRate.style.transform = `translate(${coordinateBlue}px)`;

})

socket.on('updatePlayerStats',(backendPlayers) => {
  console.log(backendPlayers);
  for (let i = 0; i < backendPlayers.length; i++) {
    players[i] = backendPlayers[i];
  }
  updatesPlayersInfo();
})

socket.on('showPhases',(phases) => {
  const phasebox = document.getElementsByClassName('showPhases');
  for (let i = 0; i < phasebox.length; i++) {
    let showPhase = phasebox[i].querySelectorAll('.showPhase');
    showPhase[0].querySelector('span').innerText = `${phases[i].phase2.action} ${phases[i].phase1.property} ${phases[i].phase2.amount}`;
    showPhase[1].querySelector('span').innerText = `${phases[i].phase3.influencedProperty} ${phases[i].phase3.influence}`;
    phasebox[i].style.visibility = 'visible';
  }
})

socket.on('hidePhases',() => {
  const phasebox = document.getElementsByClassName('showPhases');
  for (let i = 0; i < phasebox.length; i++) {
    phasebox[i].style.visibility = 'hidden';
  }
})

socket.on('roundCounter',(roundCount) => {
  if(currentTurn !== 0) {
    roundBox[roundCount - 1].style.borderBottomColor = "rgba(65, 65, 65, 0.425)";
  }
  roundBox[roundCount].style.borderBottomColor = "red";
})

socket.on('gameOver',(winner)=> {
  const result = `Game Over! The winner is ${winner.getName()} with $${maxMoney}.`;
  window.alert(result);
  button.removeEventListener("click", selectPhases);
})


