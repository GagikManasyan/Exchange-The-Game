const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const socket = io();

socket.emit("joinRoom", username, room);

socket.on("roomFull", () => {
  window.alert("The room is already full. You cannot join at the moment.");
  backToLobby();
});

socket.on("redirectToIndex", () => {
  backToLobby();
});

const button = document.getElementById("confirm");
const playerBox = document.getElementsByClassName("player-box");
const roundBox = document.getElementsByClassName("round");
const btn = document.getElementById("confirm");
const wrapper = document.getElementById("wrapper");
const loading = document.getElementById("loader-layer");
let players = [];
let currentTurn = 0;

socket.on("updatePlayers", (backendPlayers) => {
  players = [...backendPlayers];
  console.log(players);
});

socket.on("ready", () => {
  start();
});

function backToLobby() {
  window.location.href = "https://exchange-the-game-bbe8435f2af8.herokuapp.com";
}

function start() {
  loading.style.display = "none";
  btn.style.display = "block";
  button.addEventListener("click", selectPhases);
  playerBox[0].classList.add("player-active");
  roundBox[0].style.borderBottomColor = "red";
  const audio = document.getElementById("myAudio");
  audio.play();
  updatePlayersInfo();
}

function updatePlayersInfo() {
  for (let i = 0; i < playerBox.length; i++) {
    let playerNameBar = playerBox[i].querySelector(".name-bar");
    let playerStats = playerBox[i].querySelector(".player-stats");
    let playerProperties = playerBox[i].querySelectorAll("li");
    playerNameBar.querySelector("span").innerText = players[i].name;
    playerStats.querySelector(".player-money").innerText = `${players[i].money}$`;
    playerProperties[0].querySelector("span").innerText = players[i].red;
    playerProperties[1].querySelector("span").innerText = players[i].green;
    playerProperties[2].querySelector("span").innerText = players[i].blue;
  }
}

socket.on("turn", (turn) => {
  playerBox[currentTurn].classList.remove("player-active");
  currentTurn = turn;
  playerBox[currentTurn].classList.add("player-active");
});

function selectPhases() {
  if (socket.id === players[currentTurn].id) {
    let phaseSelect = document.getElementsByClassName("phase");
    let playerPhase = {
      phase1: {
        property: phaseSelect[0].value,
      },
      phase2: {
        action: phaseSelect[1].value,
        amount: phaseSelect[2].value,
      },
      phase3: {
        influencedProperty: phaseSelect[3].value.slice(0, -3),
        influence: phaseSelect[3].value.slice(-2),
      },
    };
    socket.emit("buttonClick", players[2].room, playerPhase);
  }
}

socket.on("adjustMarket", (market) => {
  const rateGrid = document.querySelectorAll('.grid-rate');
  const redRate = document.querySelector('.red-rate');
  const greenRate = document.querySelector('.green-rate');
  const blueRate = document.querySelector('.blue-rate');
  rateGrid[(market.red - 10) / 10].appendChild(redRate);
  rateGrid[(market.green - 10) / 10].appendChild(greenRate);
  rateGrid[(market.blue - 10) / 10].appendChild(blueRate);
});

socket.on("updatePlayerStats", (backendPlayers) => {
  for (let i = 0; i < backendPlayers.length; i++) {
    players[i] = backendPlayers[i];
  }
  updatePlayersInfo();
});

socket.on("showPhases", (phases) => {
  const phasebox = document.getElementsByClassName("showPhases");
  for (let i = 0; i < phasebox.length; i++) {
    const showPhase = phasebox[i].querySelectorAll('.showPhase');
    showPhase[0].querySelector('.rate-box').style.backgroundColor = phases[i].phase1.property;
    showPhase[1].querySelector('span').innerText = `${phases[i].phase2.action} ${phases[i].phase2.amount}`;
    showPhase[2].querySelector('.rate-box').style.backgroundColor = phases[i].phase3.influencedProperty;
    showPhase[2].querySelector('span').innerText = `${phases[i].phase3.influence}`;
    phasebox[i].style.visibility = 'visible';
  }
});

socket.on("hidePhases", () => {
  const phasebox = document.getElementsByClassName("showPhases");
  for (let i = 0; i < phasebox.length; i++) {
    phasebox[i].style.visibility = "hidden";
  }
});

socket.on("roundCounter", (roundCount) => {
  if (currentTurn !== 0) {
    roundBox[roundCount - 1].style.borderBottomColor =
      "rgba(65, 65, 65, 0.425)";
  }
  roundBox[roundCount].style.borderBottomColor = "red";
});

socket.on("gameOver", () => {
  let sortedPlayers = [...players].sort((a,b) => b.money - a.money);
  const gameOverLayer = document.getElementById('game-over-layer');
  const gameOver = document.querySelector('.game-over-text').querySelectorAll('span');
  const redirect = document.getElementById('back-to-lobby');
  gameOverLayer.style.display = 'flex';
  gameOver[0].innerText = sortedPlayers[0] ? ` 1: ${sortedPlayers[0].name} ${sortedPlayers[0].money} $` : '';
  gameOver[1].innerText = sortedPlayers[1] ? ` 2: ${sortedPlayers[1].name} ${sortedPlayers[1].money} $` : '';
  gameOver[2].innerText = sortedPlayers[2] ? ` 3: ${sortedPlayers[2].name} ${sortedPlayers[2].money} $` : '';
  redirect.addEventListener("click", backToLobby);
});
