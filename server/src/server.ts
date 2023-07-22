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

app.get('/api/hentai-stalker/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

app.get('/api/hentai-stalker/auth/google/redirect',
  passport.authenticate('google', {
    failureRedirect: '/api/hentai-stalker/auth/google',
    failureMessage: true
  }),
  authMiddleware,
  (req, res) => { res.redirect("/hentai-stalker"); }
);

app.get('/api/hentai-stalker/auth/google/logout', (req: any, res, next) => {
  console.log('logout');
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/hentai-stalker");
  });
});

app.get('/api/hentai-stalker/user', authMiddleware, (req: any, res) => {
  if (req.user) res.status(200).json(req.user);
  res.status(403);
});

// add keyword
// app.post('/hentai-stalker/api/keywords/add', async (req, res) => {
//   // req.body = { token, keywordId, keyword }
//   const userData = await verifyUser(req.body.token);
//   if (!userData) {
//     res.status(403).json({ error: "User verification failed" });
//     return;
//   };

//   db.run(
//     `INSERT INTO keywords (UserId, KeywordId, Keyword, AddedTime)
//     VALUES (?, ?, ?, DATETIME('now'));`,
//     [userData.sub, req.body.keywordId, req.body.keyword],
//     (err) => {
//       if (err) {
//         console.error('Error adding keyword', req.body, err.message);
//         res.status(500);
//       }
//       res.status(200);
//     }
//   );
// });

// // get keywords
// app.get('/hentai-stalker/api/keywords', async (req, res) => {
//   // req.body = { token }
//   const userData = await verifyUser(req.body.token);
//   if (!userData) {
//     res.status(403).json({ error: "User verification failed" });
//     return;
//   };

//   db.all(
//     `SELECT (Keyword, AddedTime) FROM Keywords WHERE UserId = ?`, [userData.sub],
//     (err, rows) => {
//       if (err) {
//         console.error('error getting keywords', req.body, err.message);
//         res.status(500);
//       }
//       res.status(200).json(rows);
//     });
// });

app.listen(8034, () => console.log('Server is running on port 8034'));