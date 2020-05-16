const express = require('express');
const striptags = require('striptags');
const moment = require('moment');
const firebaseAdminDb = require('../connections/firebase_admin');
const convertPagination = require('../modules/convertPagination');

const router = express.Router();
const categoriesRef = firebaseAdminDb.ref('/categories');
const articlesRef = firebaseAdminDb.ref('articles');

router.get('/', (req, res) => {
  articlesRef.once('value').then((snapshot) => {
    const articles = Object.keys(snapshot.val());
    res.render('dashboard/dashboard', {
      length: articles.length,
    });
  });
});

router.get('/archives', (req, res) => {
  const currentPage = Number.parseInt(req.query.page, 10) || 1;
  const status = req.query.status || 'public';
  const chosen = 'archives';
  const position = 'dashboard';
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
        if (status === snapshotChild.val().status) {
          articles.push(snapshotChild.val());
        }
      });
      articles.reverse();
      const data = convertPagination(articles, currentPage);
      res.render('dashboard/archives', {
        articles: data.data,
        page: data.page,
        categories,
        moment,
        striptags,
        status,
        chosen,
        position,
      });
    });
});

router.get('/article/create', (req, res) => {
  categoriesRef.once('value').then((snapshot) => {
    const categories = snapshot.val();
    res.render('dashboard/article', { categories });
  });
});

router.get('/article/:id', (req, res) => {
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
      res.render('dashboard/article', {
        categories,
        article,
      });
    });
});

router.get('/categories', (req, res) => {
  const messages = req.flash('info');
  const chosen = 'categories';
  categoriesRef.once('value').then((snapshot) => {
    const categories = snapshot.val();
    res.render('dashboard/categories', {
      categories,
      messages,
      hasInfo: messages.length > 0,
      chosen,
    });
  });
});
router.post('/article/create', (req, res) => {
  const data = req.body;
  const articleRef = articlesRef.push();
  const updateTime = Math.floor(Date.now() / 1000);
  data.id = articleRef.key;
  data.update_time = updateTime;
  articleRef.set(data).then(() => {
    res.redirect(`/dashboard/article/${data.id}`);
  });
});
router.post('/article/update/:id', (req, res) => {
  const data = req.body;
  const ID = req.params.id;
  articlesRef
    .child(ID)
    .update(data)
    .then(() => {
      res.redirect(`/dashboard/article/${ID}`);
    });
});

router.post('/article/delete/:id', (req, res) => {
  const id = req.param('id');
  articlesRef.child(id).remove();
  res.end();
});

router.post('/categories/create', (req, res) => {
  const data = req.body;
  const categoryRef = categoriesRef.push();
  data.id = categoryRef.key;
  categoriesRef
    .orderByChild('path')
    .equalTo(data.path)
    .once('value')
    .then((snapshot) => {
      if (snapshot.val() !== null) {
        req.flash('info', '已有相同路徑');
        res.redirect('/dashboard/categories');
      } else {
        categoryRef.set(data).then(() => {
          res.redirect('/dashboard/categories');
        });
      }
    });
});
router.post('/categories/delete/:id', (req, res) => {
  const id = req.param('id');
  categoriesRef.child(id).remove();
  req.flash('info', '欄位已刪除');
  res.redirect('/dashboard/categories');
});
module.exports = router;
