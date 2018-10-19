[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://choosealicense.com/licenses/mit/)
[![Build Status](https://travis-ci.org/QUDUSKUNLE/DevelopersContact.svg?branch=develop)](https://travis-ci.org/QUDUSKUNLE/DevelopersContact)
[![Coverage Status](https://coveralls.io/repos/github/QUDUSKUNLE/DevelopersContact/badge.svg?branch=develop)](https://coveralls.io/github/QUDUSKUNLE/DevelopersContact?branch=develop)
[![Maintainability](https://api.codeclimate.com/v1/badges/07b73613abd04df3abac/maintainability)](https://codeclimate.com/github/QUDUSKUNLE/DevelopersContact/maintainability)
# DevelopersContant
A simple CRUD that categories developer as either a front-end developer or backend developer

# Feature
DevelopersContact allows users to do the following.
 - Register and log into their accounts.
 - Create pool of Developers Contact
   - Users can view other developers be Backend or Front-end Developers
   - Users can see Developers according to location
   - Users can comment on Ideas found interesting to him/her

# Folder Structure

 The `server` directory houses the back-end implementation in <a href="https://nodejs.org/">node.js</a>, <a href="https://expressjs.com/">express</a> & <a href="https://http://mongoosejs.com/">mongoose</a>
 

# Technology Stack
- Back-end: Node, Express and Mongoose


# Get Started
  Kindly follow the steps below to setup a local development environment.
  + ```Clone``` this repository from a terminal ```git clone  https://github.com/QUDUSKUNLE/DevelopersContact/tree/develop```

  + ```cd``` into the project directory

  + install project dependencies ```npm install```

  + Create an account on ```mongoose``` and set up the app

  + Create ```.env``` file and set up the variables in ```.env-sample``` to your specified database connection gotten from ```mongoose```
   + Connet to database local by running `mongod` on terminal

   + and run ```npm run start:dev``` for development and `npm start` for production

   + Go to ```http://localhost:3000/```

## Test
 - This app uses Mocha, Chai-Http for `server test` and `jest` for `client test`
   - Run npm i mocha -g to install Mocha globally and npm i nyc -g to install nyc globally before running npm test to run `server` tests

+ ```git clone https://github.com/QUDUSKUNLE/DevelopersContact```

+ run ```npm test``` for ```server test```


 ## License
 
This software is licensed under the MIT License. See the <a href="https://github.com/QUDUSKUNLE/DevelopersContact/blob/develop/LICENCE">LICENSE</a> file in the top distribution directory for the full license text.
