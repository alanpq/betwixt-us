import express from 'express'

const app = express()
const port = process.env.PORT || 80

app.set('view engine', 'pug')
app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`Example app listening at http://0.0.0.0:${port}`)
})