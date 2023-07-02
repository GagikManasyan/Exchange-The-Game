const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io();
socket.emit('joinRoom',  username, room);

const button = document.getElementById("confirm");
const playerBox = document.getElementsByClassName("player-box");
const roundBox = document.getElementsByClassName("round");
const popUp = document.querySelector('.pop-up');

let players = [];
let currentTurn = 0;

socket.on('test',(test) => {
  console.log(test);
})

socket.on('updatePlayers',(backendPlayers) => {
  players = [...backendPlayers];
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
  if (socket.id === players[currentTurn].id) {
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
    };
    socket.emit('buttonClick',players[2].room,playerPhase);
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
  const result = `Game Over! The winner is ${winner.name} with $${winner.money}.`;
  window.alert(result);
  button.removeEventListener("click", selectPhases);
})


