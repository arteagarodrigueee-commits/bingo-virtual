const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = new Map();

function makeCard() {
  const ranges = [[1,15],[16,30],[31,45],[46,60],[61,75]];
  const cols = ranges.map(([a,b]) => {
    const x = [];
    while (x.length < 5) {
      const n = a + Math.floor(Math.random() * (b-a+1));
      if (!x.includes(n)) x.push(n);
    }
    return x;
  });
  return Array.from({length:5}, (_,r) => cols.map(c => c[r]));
}

function cleanRoom(room) {
  return String(room || "SALA").trim().toUpperCase().slice(0, 12);
}

function publicState(room) {
  return {
    room: room.code,
    drawn: room.drawn,
    players: [...room.players.values()].map(p => ({
      id: p.id,
      name: p.name,
      card: p.card
    })),
    hostId: room.hostId
  };
}

io.on("connection", socket => {
  socket.on("joinRoom", ({ room: rawRoom, name: rawName }) => {
    const code = cleanRoom(rawRoom);
    const name = String(rawName || "Jugador").trim().slice(0, 30) || "Jugador";

    if (!rooms.has(code)) {
      rooms.set(code, {
        code,
        drawn: [],
        players: new Map(),
        hostId: socket.id
      });
    }

    const room = rooms.get(code);
    const player = { id: socket.id, name, card: makeCard() };
    room.players.set(socket.id, player);

    socket.join(code);
    socket.data.room = code;

    io.to(code).emit("state", publicState(room));
  });

  socket.on("draw", () => {
    const code = socket.data.room;
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id || room.drawn.length >= 75) return;

    let n;
    do n = 1 + Math.floor(Math.random() * 75);
    while (room.drawn.includes(n));

    room.drawn.push(n);
    io.to(code).emit("state", publicState(room));
  });

  socket.on("reset", () => {
    const code = socket.data.room;
    const room = rooms.get(code);
    if (!room || room.hostId !== socket.id) return;

    room.drawn = [];
    for (const p of room.players.values()) p.card = makeCard();
    io.to(code).emit("state", publicState(room));
  });

  socket.on("disconnect", () => {
    const code = socket.data.room;
    const room = rooms.get(code);
    if (!room) return;

    room.players.delete(socket.id);

    if (room.hostId === socket.id) {
      const next = room.players.values().next().value;
      room.hostId = next ? next.id : null;
    }

    if (room.players.size === 0) {
      rooms.delete(code);
    } else {
      io.to(code).emit("state", publicState(room));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Bingo server running on port ${PORT}`);
});
