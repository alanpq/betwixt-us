import express from 'express'
import path from 'path'

const app = express()
const port = process.env.PORT || 80

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

app.listen(port, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`)
})