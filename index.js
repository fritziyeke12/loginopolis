const express = require('express');
const app = express();
const bcrypt = require("bcrypt");
const SALT_COUNT = 8;
const { User } = require('./db');
const sequelize = require('sequelize');

//function to hash plain pw
async function hash(password){
  let hashedPw = await bcrypt.hash(password, SALT_COUNT);
  return hashedPw;
}

//function to check passwords validity
const comparePw = async (plainPw, hashedPw) => {
  let isMatch = await bcrypt.compare(plainPw, hashedPw);
  return isMatch;
}

//function to register users
const register = async (username, plainPw) => {
  // await sequelize.sync({force: true});
  try {
    let hashedPw = await hash(plainPw);
    let createdUser = await User.create({username, password: hashedPw});
    return createdUser

  } catch (error) {
    console.error(err);
  }

}

//function to login in verified users
async function login(username, plainPw){
  try {
    const [foundUser] = await User.findAll({where: {username}});
    if(!foundUser){
      return "Failed Login";
    }

    let isMatch = await comparePw(plainPw, foundUSer.password);
    if(isMatch){
      return "Successful Login";
    }
    else{
      return "Failed Login";
    }

  } catch (error) {
    console.error(err);
  }
}

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/', async (req, res, next) => {
  try {
    res.send('<h1>Welcome to Loginopolis!</h1><p>Log in via POST /login or register via POST /register</p>');
  } catch (error) {
    console.error(error);
    next(error)
  }
});

// POST /register
// TODO - takes req.body of {username, password} and creates a new user with the hashed password
app.post("/register", async (req, res, next) => {
  try {
    let user = register(req.body.username, req.body.password)
    .then((result) => {
      console.log(result);
    })
    res.status(201).send(user);
  } catch (error) {
    next(err);
    res.status(500).send({error: err.toString()});
  }
})

// POST /login
// TODO - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB

// we export the app, not listening in here, so that we can run tests
module.exports = app;
