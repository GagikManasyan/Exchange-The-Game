const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const cards = [
  {
    money: 200,
    red: 10,
    green: 3,
    blue: 3,
  },
  {
    money: 100,
    red: 5,
    green: 6,
    blue: 2,
  },
  {
    money: 150,
    red: 0,
    green: 6,
    blue: 11,
  },
  {
    money: 300,
    red: 4,
    green: 4,
    blue: 6,
  },
  {
    money: 250,
    red: 5,
    green: 5,
    blue: 5,
  },
  {
    money: 100,
    red: 4,
    green: 8,
    blue: 6,
  },
  {
    money: 400,
    red: 2,
    green: 6,
    blue: 4,
  },
  {
    money: 400,
    red: 6,
    green: 2,
    blue: 4,
  },
  {
    money: 300,
    red: 10,
    green: 4,
    blue: 0,
  },
  {
    money: 200,
    red: 3,
    green: 3,
    blue: 10,
  },
  {
    money: 200,
    red: 3,
    green: 10,
    blue: 3,
  },
  {
    money: 100,
    red: 8,
    green: 4,
    blue: 6,
  },
];
const rooms = {
};
let cardAssign = 0;
const Player = require("./class/player.js");

shuffleCards();

io.on("connection", (socket) => {
  socket.on("joinRoom", (username,userRoom) => {
    let player = new Player(cards[cardAssign++], username, socket.id, userRoom);
    if (!rooms[player.room]) {
      rooms[player.room] = {
        players: [],
        playerPhases: [],
        market: {
          red:10,
          green:10,
          blue:10
        },
        currentTurn: 0,
        roundCount: 0
      }; 
    }
    rooms[player.room].players.push(player);
    socket.join(player.room);
    console.log(`user ${player.name} joined the ${player.room}`);
    io.to(player.room).emit("updatePlayers", rooms[player.room].players);
    if (isReady(player.room)) {
      console.log('ready')
      io.to(player.room).emit("ready");
    }
  });
  socket.on("disconnect", (reason) => {
    for (let room in rooms) {
      const index = rooms[room].players.findIndex(player => player.id === socket.id);
      if (index !== -1) {
        console.log(`${rooms[room].players[index].name} is leaving the room ${reason}`);
        const removedPlayer = rooms[room].players.splice(index, 1)[0];
        io.to(removedPlayer.room).emit("updatePlayers", rooms[room].players);
      }
    }
  });
  socket.on("buttonClick", (playerRoom, playerPhase) => {
    rooms[playerRoom].playerPhases.push(playerPhase);
    changeTurn(playerRoom);
  });
});

function shuffleCards() {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
}

function isReady(room) {
  return rooms[room].players && rooms[room].players.length === 3;
}

function updateTurn(room) {
  io.to(room).emit("turn", rooms[room].currentTurn);
}

function changeTurn(room) {
  if (rooms[room].currentTurn === 2) {
    adjustMarket(room);
    buySell(room);
    roundCounter(room);
    io.to(room).emit("showPhases", rooms[room].playerPhases);
    rooms[room].playerPhases = [];
    rooms[room].currentTurn = 0;
  } else {
    io.to(room).emit('hidePhases');
    rooms[room].currentTurn++;
  }
  updateTurn(room);
}

function adjustMarket(room) {
  let playerPhases = rooms[room].playerPhases;
  for (let i = 0; i < playerPhases.length; i++) {
    const playerColor = playerPhases[i].phase3.influencedProperty;
    const playerInfluence = playerPhases[i].phase3.influence;
    if (playerInfluence === "+1") {
      rooms[room].market[playerColor] = rooms[room].market[playerColor] === 90 ? 10 : rooms[room].market[playerColor] + 10;
    } else if (playerInfluence === "-1") {
      rooms[room].market[playerColor] = rooms[room].market[playerColor] === 10 ? 90 : rooms[room].market[playerColor] - 10;
    }
  }
  io.to(room).emit("adjustMarket", rooms[room].market);
}

function buySell(room) {
  const players = rooms[room].players; 
  for (let i = 0; i < players.length; i++) {
    let currentPlayer = players[i];
    let playerProperty = rooms[room].playerPhases[i].phase1.property;
    let action = rooms[room].playerPhases[i].phase2.action;
    let amount = rooms[room].playerPhases[i].phase2.amount;
    if (action === "buy") {
      currentPlayer.addProperty(playerProperty, amount * 1);
      currentPlayer.removeMoney(rooms[room].market[playerProperty] * (amount * 1));
    } else if (action === "sell") {
      if (currentPlayer[playerProperty] >= amount * 1) {
        currentPlayer.removeProperty(playerProperty, amount * 1);
        currentPlayer.addMoney(rooms[room].market[playerProperty] * (amount * 1));
      }
    }
  }
  io.to(room).emit("updatePlayerStats", rooms[room].players);
}

function gameOver(room) {
  let maxMoney = 0;
  let winner = null;
  const players = rooms[room].players; 
  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    let money = player.getMoney();
    if (money > maxMoney) {
      maxMoney = money;
      winner = player;
    }
  }
  io.to(room).emit('gameOver', winner);
}

function roundCounter(room) {
  if (rooms[room].roundCount === 4) {
    gameOver(room);
  } else {
    rooms[room].roundCount++;
    io.to(room).emit('roundCounter', rooms[room].roundCount);
  }
}

server.listen(port, () => {
  console.log(`App is listening to port ${port}`);
});

