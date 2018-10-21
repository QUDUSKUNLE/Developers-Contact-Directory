[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://choosealicense.com/licenses/mit/)
[![Build Status](https://travis-ci.org/QUDUSKUNLE/Developers-Contact-Directory.svg?branch=master)](https://travis-ci.org/QUDUSKUNLE/Developers-Contact-Directory)

### DevelopersContant
A simple CRUD that categories developer as either a front-end developer or backend developer

### Feature
DevelopersContact allows users to do the following.
 - Register and log into their accounts.
 - Create pool of Developers Contact
   - Users can view other developers be Backend or Front-end Developers
   - Users can see Developers according to location
   - Users can comment on Ideas found interesting to him/her

### Folder Structure

 The `server` directory houses the back-end implementation in <a href="https://nodejs.org/">node.js</a>, <a href="https://expressjs.com/">express</a> & <a href="https://http://mongoosejs.com/">mongoose</a>
 

### Technology Stack
- Back-end: Node, Express and Mongoose


### Get Started
  Kindly follow the steps below to setup a local development environment.
  + ```Clone``` this repository from a terminal ```git clone  https://github.com/QUDUSKUNLE/DevelopersContact```

  + ```cd``` into the project directory

  + install project dependencies ```npm install```

  + Create an account on ```mongoose``` and set up the app

  + Create ```.env``` file and set up the variables in ```.env-sample``` to your specified database connection gotten from ```mongoose```
   + Connet to database local by running `mongod` on terminal

   + and run `npm start` to run the application

   + Go to ```http://localhost:8000/```

### Test
 - This app uses Mocha, Chai-Http for `test`
   - Run npm i mocha -g to install Mocha globally and npm i nyc -g to install nyc globally before running npm test to run tests

+ ```git clone https://github.com/QUDUSKUNLE/DevelopersContact```

+ run ```npm test```
