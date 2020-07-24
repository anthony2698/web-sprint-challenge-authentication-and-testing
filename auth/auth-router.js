const router = require('express').Router();

const Users = require('./auth-model');
const newToken = require('./giveToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/register', (req, res) => {
    const rounds = 6;
    const credentials = req.body;
    const hash = bcrypt.hashSync(credentials.password, rounds);

    credentials.password = hash;

    if(credentials.username && credentials.password) {
        Users.add(credentials)
        .then(saved => {
            const token = newToken(saved);
            res.status(201).json(token);
        })
        .catch(err => {
            res.status(500).json({ message: err })
        })
    } else {
        res.status(400).json({ Message: 'Enter username and password' })
    }
});

router.post('/login', (req, res) => {
    let { username, password } = req.body;

      Users.findBy({ username })
          .first()
          .then(user => {
              if (user && bcrypt.compareSync(password, user.password)) {
                  const token = newToken(user);
                  res.status(200).json({ Message: `Welcome ${user.username}`, token });
              } else {
                  res.status(401).json({ Message: 'Credentials not valid' });
              }
          })
          .catch(err => {
              res.status(500).json({ Message: 'error logining in' })
          })
});

module.exports = router;
