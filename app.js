require('dotenv').config()

const port = process.env.PORT
const cors = require('cors');
const express = require('express');
const resetUplods = require('./Database/resetUploads');
const Auth_Middleware = require('./Middleware/Firebase/Firebase_Auth');
const router = require('./Router/router')

const app = express()
app.use(cors())

//Json parser for reading post request data
app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))

app.get('/', (req, res) => {
  try {
    res.send({
      error:true,
      msg: 'Welcome to the Anki to JSON API.'
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      error:true,
      msg: 'Internal error in API'
    })
  }
})

app.use('/', router)

app.get('*', (req, res) => {
  try {
    res.status(404).send({
      error:true,
      message: ['Endpoint not found.']
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      error:true,
      message: 'Internal error in API'
    })
  }
})

resetUplods()

app.listen(port, 'localhost', () => {
    console.log(`app running on port ${port}`)
})
