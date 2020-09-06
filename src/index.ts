import express from 'express'
import socketio from 'socket.io'
import http from 'http';
import path from 'path'

const app = express()
const server = http.createServer(app);
const port = process.env.PORT || 80

const io = socketio(server);

import { roomCodes } from './data';
import Room from './Room';
import { v4 as uuid } from 'uuid';

import Player from './game/IPlayer';

app.use('/', express.static(path.join(__dirname, "..", "public")))

app.set('view engine', 'pug')

// TODO: use a router
app.get('/room/:room', (req, res) => {
  if (!req.params.room.match(/^([A-Z]){4}$/g)) // Check if code isn't exactly 4 capital letters
    return res.status(400).json({
      status: 401,
      message: "Invalid room code."
    })

  if (!roomCodes[req.params.room])             // Check room exists
    return res.status(404).json({
      status: 404,
      message: "Room not found."
    })

  res.status(200).json({
    status: 200,
    message: "Room found."
  })
})

app.post('/room/create', (req, res) => {
  const room = new Room();
  roomCodes[room.code] = room;
  res.status(200).json({
    status: 200,
    code: room.code,
  });
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/game', (req, res) => {
  res.render('game')
})

// TODO: move this shit elsewhere

const workspaces = io.of(/^\/([A-Z]){4}$/);
// TODO: look into namespace middlewares
workspaces.on('connection', (socket: socketio.Socket) => {
  const workspace = socket.nsp;
  const room: Room = roomCodes[workspace.name.slice(1)]
  console.log(`user connected to ${room.code}`);

  socket.on('movement update', (id: string, pos: { x: number, y: number }, vel: { x: number, y: number }) => {
    socket.broadcast.emit('movement update', id, pos, vel);
  })

  // Create this new player
  const player: Player = {
    id: uuid(),
    pos: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    name: Math.random() + "",
    color: Math.floor(Math.random() * 11),
  };
  socket.emit('you', player); // send new player themselves (meta)
  socket.broadcast.emit('new player', player); // send new player to all existing players

  for (let pl of Object.values(room.players)) { // send all existing players to new player
    socket.emit('new player', pl);
  }

  socket.on('disconnect', () => {
    socket.broadcast.emit('player leave', player.id)
    delete room.players[player.id]
  })

  room.players[player.id] = player;
});

// io.on('connection', (socket) => {
//   console.log('general io connection');


//   socket.on('disconnect', () => {
//     console.log('general io disconnected');
//   });
// });

server.listen(port, () => {
  console.log(`Example app listening at http://127.0.0.1:${port}`)
})