const express = require('express');
const app = express();
const { User } = require('./db');
const bcrypt = require("bcrypt");
const SALT_LENGTH = 10;

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
 
  const {username, password} = req.body;

  try {
    let hashedPw = await bcrypt.hash(password, SALT_LENGTH); //hashes the password passed into the req.body
    let user = await User.create({username, password: hashedPw}); //creates a new user in the db with the passed in username and pw

    res.status(201).send(user);//returns the created user

  } catch (error) {
    next(error);
    res.status(500).send({ error: error.toString() });
  }
})

// POST /login
// TODO - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB
app.post("/login", async (req, res, next) => {

  const {username, password} = req.body;

  try {
    let [foundUser] = await User.findAll({where: {username}});//searches the db for a user with a matching username returns null if none are found
    console.log(foundUser);
    if(!foundUser){
      res.status(500).send("Error: No User Found");// returns an appropriate msg and error code if an incorrect username is entered

      return;//code below this line won't run if an invalid username is inputted
    }

    let isMatch = await bcrypt.compare(password, foundUser.password);//compares the inputted pw with the hashed pw in the db

    if(isMatch){
      res.status(202).send("Logged in");//logs in is the pw is valid
    }
    else{
      res.status(401).send("Incorrect Password");//401 is unathourised
    }

  } catch (error) {
    next(error);
    res.status(500).send({ error: error.toString });
  }
})

// we export the app, not listening in here, so that we can run tests
module.exports = app;
