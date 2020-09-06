import express from 'express'
import path from 'path'

const app = express()
const port = process.env.PORT || 80

import { roomCodes } from './data';

app.use('/', express.static(path.join(__dirname, "..", "public")))

app.set('view engine', 'pug')

// TODO: use a router
app.get('/room/:room', (req, res) => {
  if (!req.params.room.match(/^([A-Z]){4}$/g)) // Check if code isn't exactly 4 capital letters
    return res.status(400).json({
      code: 401,
      message: "Invalid room code."
    })

  if (!roomCodes[req.params.room])             // Check room exists
    return res.status(404).json({
      code: 404,
      message: "Room not found."
    })

  res.status(200).json({
    code: 200,
    message: "Room found."
  })
})

app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`)
})