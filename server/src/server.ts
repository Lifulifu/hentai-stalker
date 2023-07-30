import express, { type Request, type Response } from "express";
import sqlite3 from "sqlite3";
import passport from 'passport';
require("./passport_config")(passport);
import session from 'express-session';

const app = express();
app.use(express.json());
app.use(session({
  secret: 'lifubeam',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

const db = new sqlite3.Database('db/main.db', (err) => {
  if (err) console.error('error connecting to db', err.message);
});

async function isInWhitelist(email: string) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT Email FROM Whitelist WHERE Email = ?',
      [email.toLowerCase()], (err, row) => {
        if (err) {
          console.error("Failed to get Whitelist.", err);
          resolve(false);
        } else if (row) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
  });
}

async function authMiddleware(req, res, next) {
  if (req.isAuthenticated() && await isInWhitelist(req.user.email)) {
    return next();
  }
  // not authenticated
  res.redirect("/api/hentai-stalker/auth/google");
}

// auth
app.get('/api/hentai-stalker/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/api/hentai-stalker/auth/google/redirect',
  passport.authenticate('google', {
    failureRedirect: '/api/hentai-stalker/auth/google',
    failureMessage: true
  }),
  authMiddleware,
  (req, res) => { return res.redirect("/hentai-stalker"); }
);

app.get('/api/hentai-stalker/auth/google/logout', (req: any, res, next) => {
  console.log('logout');
  req.logout((err) => {
    if (err) return next(err);
    return res.redirect("/hentai-stalker");
  });
});

app.get('/api/hentai-stalker/user', authMiddleware, (req: any, res) => {
  if (req.user) return res.status(200).json(req.user);
  return res.status(403).send("Cannot get user data.");
});

// add keyword
app.post('/api/hentai-stalker/keywords/add', authMiddleware, async (req: any, res) => {
  db.run(
    `INSERT INTO keywords (UserId, KeywordId, Keyword, AddedTime)
    VALUES (?, ?, ?, DATETIME('now'));`,
    [req.user.id, req.body.keywordId, req.body.keyword],
    (err) => {
      if (err) {
        console.error('Error adding keyword', req.body, err.message);
        return res.status(403).send("Error adding keyword");
      }
      console.log('New keyword', req.body.keyword, 'added.');
      return res.status(200).send();
    }
  );
});

// remove keyword
app.post('/api/hentai-stalker/keywords/remove', authMiddleware, async (req: any, res) => {
  db.run(`DELETE FROM keywords WHERE UserId = ? AND KeywordId = ?`,
    [req.user.id, req.body.keywordId],
    (err) => {
      if (err) {
        console.error('Error removing keyword', req.body, err.message);
        return res.status(403).send("Error removing keyword");
      }
      console.log('Keyword', req.body.keyword, 'removed.');
      return res.status(200).send();
    }
  );
});

// get keywords
app.get('/api/hentai-stalker/keywords', authMiddleware, async (req: any, res) => {
  db.all(
    `SELECT * FROM Keywords WHERE UserId = ?`, [req.user.id],
    (err, rows) => {
      if (err) {
        console.error('Error getting keywords', req.body, err.message);
        return res.status(403).send('Error getting keywords');
      }
      return res.status(200).json({
        value: rows.map((row: any) => ({
          keyword: row.Keyword,
          keywordId: row.KeywordId,
          addedTime: row.AddedTime
        }))
      });
    });
});

// get galleries
app.get('/api/hentai-stalker/galleries', authMiddleware, async (req: any, res) => {
  db.all(
    `SELECT * FROM Galleries WHERE UserId = ?`,
    [req.user.id],
    (err, rows) => {
      if (err) {
        console.error('Error getting galleries', req.body, err.message);
        return res.status(403).send('Error getting galleries');
      }
      return res.status(200).json({
        value: rows.map((row: any) => ({
          keyword: row.Keyword,
          url: row.Url,
          thumbUrl: row.ThumbUrl,
          title: row.Title,
          addedTime: row.AddedTime,
          postedTime: row.PostedTime
        }))
      });
    }
  );
});

app.listen(8034, () => console.log('Server is running on port 8034'));