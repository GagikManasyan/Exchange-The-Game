const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });
const port = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const cards = [
  {
    name: "Alexander",
    money: 200,
    red: 10,
    green: 3,
    blue: 3,
  },
  {
    name: "Hugh",
    money: 100,
    red: 5,
    green: 6,
    blue: 2,
  },
  {
    name: "David",
    money: 150,
    red: 0,
    green: 6,
    blue: 11,
  },
  {
    name: "Andrew",
    money: 300,
    red: 4,
    green: 4,
    blue: 6,
  },
  {
    name: "Samuel",
    money: 250,
    red: 5,
    green: 5,
    blue: 5,
  },
  {
    name: "Augustine",
    money: 100,
    red: 4,
    green: 8,
    blue: 6,
  },
  {
    name: "Peter",
    money: 400,
    red: 2,
    green: 6,
    blue: 4,
  },
  {
    name: "Benjamin",
    money: 400,
    red: 6,
    green: 2,
    blue: 4,
  },
  {
    name: "Gideon",
    money: 300,
    red: 10,
    green: 4,
    blue: 0,
  },
  {
    name: "Ehraim",
    money: 200,
    red: 3,
    green: 3,
    blue: 10,
  },
  {
    name: "Isaac",
    money: 200,
    red: 3,
    green: 10,
    blue: 3,
  },
  {
    name: "Leonard",
    money: 100,
    red: 8,
    green: 4,
    blue: 6,
  },
];
const players = [];
let playerPhases = [];
let market = {
  red: 10,
  green: 10,
  blue: 10,
};
let cardAssign = 0;
let currentTurn = 0;
let roundCount = 0;

const Player = require("./class/player.js");

function shuffleCards() {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
}

function isReady() {
  return players.length === 3;
}

function updateTurn() {
  io.emit("turn", currentTurn);
}

function changeTurn() {
  if (currentTurn === 2) {
    adjustMarket();
    buySell();
    roundCounter();
    io.emit("showPhases", playerPhases);
    currentTurn = 0;
  } else {
    io.emit('hidePhases');
    currentTurn++;
  }
  updateTurn();
}

function adjustMarket() {
  for (let i = 0; i < playerPhases.length; i++) {
    const playerColor = playerPhases[i].phase3.influencedProperty;
    const playerInfluence = playerPhases[i].phase3.influence;
    if (playerInfluence === "+1") {
      market[playerColor] =
        market[playerColor] === 90 ? 10 : market[playerColor] + 10;
    } else if (playerInfluence === "-1") {
      market[playerColor] =
        market[playerColor] === 10 ? 90 : market[playerColor] - 10;
    }
  }
  io.emit("adjustMarket", market);
}

function buySell() {
  for (let i = 0; i < players.length; i++) {
    let currentPlayer = players[i];
    let playerProperty = playerPhases[i].phase1.property;
    let action = playerPhases[i].phase2.action;
    let amount = playerPhases[i].phase2.amount;
    if (action === "buy") {
      currentPlayer.addProperty(playerProperty, amount * 1);
      currentPlayer.removeMoney(market[playerProperty] * (amount * 1));
    } else if (action === "sell") {
      if (currentPlayer[playerProperty] >= amount * 1) {
        currentPlayer.removeProperty(playerProperty, amount * 1);
        currentPlayer.addMoney(market[playerProperty] * (amount * 1));
      }
    }
  }
  io.emit("updatePlayerStats", players);
}

function gameOver() {
  let maxMoney = 0;
  let winner = null;
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    let money = player.getMoney();
    if (money > maxMoney) {
      maxMoney = money;
      winner = player;
    }
  }
  io.emit('gameOver',winner);
}

function roundCounter() {
  if (roundCount === 4) {
    gameOver();
  } else {
    roundCount++;
    io.emit('roundCounter',roundCount);
  }
}

shuffleCards();

io.on("connection", (socket) => {
  console.log("a user connected");
  let player = new Player(cards[cardAssign++], socket.id);
  players.push(player);
  io.emit("updatePlayers", players);

  socket.on("disconnect", (reason) => {
    console.log(reason);
    players.splice(cardAssign - 1, 1);
    cardAssign--;
    io.emit("updatePlayers", players);
  });

  socket.on("buttonClick", (playerPhase) => {
    playerPhases.push(playerPhase);
    changeTurn();
  });

  if (isReady()) {
    io.emit("ready");
  }
});

server.listen(port, () => {
  console.log(`App is listening to port ${port}`);
});

console.log("server is loaded");
