const express = require('express')
const users = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt=require('bcrypt')

const User = require('../models/User')
users.use(cors())

process.env.SECRET_KEY = 'secret'

users.post('/register', (req, res) => {
  const today = new Date()
  const userData = {
    name: req.body.name,
    store: req.body.store,
    place: req.body.place,
    phone: req.body.phone,
    username: req.body.username,
    password: req.body.password,
    created: today
  }

  User.findOne({
    username: req.body.username
  })
    //TODO bcrypt
    .then(user => {
      if (!user) {
          bcrypt.hash(req.body.password,10,(err,hash)=>{
              userData.password=hash
          
        User.create(userData)
          .then(user => {
            const payload = {
              _id: user._id,
              username: user.username,
              password: user.password
            }
            let token = jwt.sign(payload, process.env.SECRET_KEY, {
              expiresIn: 1440
            })
            res.json({ token: token })
          })
          .catch(err => {
            res.send('error: ' + err)
          })
        
        })
      } else {
        res.json({ error: 'User already exists' })
      }
    
    })

    .catch(err => {
      res.send('error: ' + err)
    })

})

users.post('/login', (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .then(user => {
      if (user) {
        const payload = {
          _id: user._id,
          username: user.username,
          password: user.password
        }
        let token = jwt.sign(payload, process.env.SECRET_KEY, {
          expiresIn: 1440
        })
        res.json({ token: token })
      } else {
        res.json({ error: 'User does not exist' })
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})

users.get('/profile', (req, res) => {
  var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)

  User.findOne({
    _id: decoded._id
  })
    .then(user => {
      if (user) {
        res.json(user)
      } else {
        res.send('User does not exist')
      }
    })
    .catch(err => {
      res.send('error: ' + err)
    })
})
users.get('/get',(req,res)=>{
    User.find({},(err,data)=>{
        if(err) throw err
        res.json({data:data})
    })
})
module.exports = users
