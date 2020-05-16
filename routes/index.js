const express = require('express');
const striptags = require('striptags');
const moment = require('moment');
const convertPagination = require('../modules/convertPagination');

const router = express.Router();
const firebaseAdminDb = require('../connections/firebase_admin');

const categoriesRef = firebaseAdminDb.ref('/categories');
const articlesRef = firebaseAdminDb.ref('articles');
/* GET home page. */
router.get('/', (req, res) => {
  const currentPage = Number.parseInt(req.query.page, 10) || 1;
  const position = 'index';
  let categories = {};
  categoriesRef
    .once('value')
    .then((snapshot) => {
      categories = snapshot.val();
      return articlesRef.orderByChild('update_time').once('value');
    })
    .then((snapshot) => {
      const articles = [];
      snapshot.forEach((snapshotChild) => {
        if (snapshotChild.val().status === 'public') {
          articles.push(snapshotChild.val());
        }
      });
      articles.reverse();
      const data = convertPagination(articles, currentPage);
      res.render('index', {
        articles: data.data,
        categories,
        categoryId: null,
        page: data.page,
        moment,
        striptags,
        position,
      });
    });
});
//
router.get('/archives/:category', (req, res) => {
  const currentPage = Number.parseInt(req.query.page, 10) || 1;
  const categoryPath = req.params.category;
  let categoryId = '';
  const position = 'index';
  let categories = {};
  categoriesRef
    .once('value')
    .then((snapshot) => {
      categories = snapshot.val();
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.val().path === categoryPath) {
          categoryId = childSnapshot.val().id;
        }
      });
      return articlesRef.orderByChild('update_time').once('value');
    })
    .then((snapshot) => {
      const articles = [];
      snapshot.forEach((snapshotChild) => {
        if (
          snapshotChild.val().status === 'public' &&
          snapshotChild.val().category === categoryId
        ) {
          articles.push(snapshotChild.val());
        }
      });
      articles.reverse();
      const data = convertPagination(articles, currentPage);
      res.render('index', {
        articles: data.data,
        categories,
        categoryId,
        page: data.page,
        moment,
        striptags,
        position,
      });
    });
});
//
router.get('/post/:id', (req, res) => {
  const ID = req.params.id;
  let categories = {};

  categoriesRef
    .once('value')
    .then((snapshot) => {
      categories = snapshot.val();
      return articlesRef.child(ID).once('value');
    })
    .then((snapshot) => {
      const article = snapshot.val();
      if (!article) {
        return res.render('error', {
          title: '找不到該文章',
        });
      }
      return res.render('post', {
        categoryId: null,
        categories,
        article,
        moment,
      });
    });
});

router.get('/dashboard/signup', (req, res) => {
  res.render('dashboard/signup');
});
module.exports = router;
