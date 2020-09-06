import express from 'express'
import path from 'path'

const app = express()
const port = process.env.PORT || 80

app.use('/', express.static(path.join(__dirname, "..", "public")))

app.set('view engine', 'pug')
app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`)
})