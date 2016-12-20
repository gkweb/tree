require('dotenv').config()
const path = require('path')
const express = require('express')
const app = express()
const content = require('./data/content')

app.set('view engine', 'pug')

// Set views path
app.set('views', path.join(__dirname, 'components'))

// Expose directories for access by client
app.use('/components', express.static(path.join(__dirname, 'components')))
app.use('/bundle', express.static(path.join(__dirname, 'bundle')))
app.use('/content', express.static(path.join(__dirname, 'content')))

// One page app
app.get('/', function (req, res) {
  res.render('app/index', content)
})

app.listen(process.env.DEV_PORT, function () {
  console.log(`Example app listening on port ${process.env.DEV_PORT}`)
})
