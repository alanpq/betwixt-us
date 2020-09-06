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
workspaces.on('connection', socket => {
  const workspace = socket.nsp;
  console.log(`user connected to ${workspace.name}`)
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