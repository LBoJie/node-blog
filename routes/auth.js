const express = require('express');
const firebase = require('../connections/firebase_client');

const fireAuth = firebase.auth();
const router = express.Router();

router.get('/signin', (req, res) => {
  res.render('dashboard/signin');
});

router.get('/signup', (req, res) => {
  res.render('dashboard/signup');
});

router.post('/signin', (req, res) => {
  fireAuth
    .signInWithEmailAndPassword(req.body.email, req.body.password)
    .then((user) => {
      req.session.uid = user.uid;
      res.redirect('/dashboard');
    })
    .catch(() => {
      res.redirect('/auth/signin');
    });
});

router.post('/signup', (req, res) => {
  fireAuth
    .createUserWithEmailAndPassword(req.body.email, req.body.password)
    .then(() => {
      res.redirect('/auth/signin');
    })
    .catch((error) => {
      req.flash('error', error.message);
      res.redirect('/signup');
    });
});
router.post('/logout', (req, res) => {
  req.session.uid = '';
  res.end();
});

module.exports = router;
