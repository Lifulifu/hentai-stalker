const GoogleStrategy = require('passport-google-oauth20').Strategy;
import sqlite3 from "sqlite3";
import client_secret from "../client_secret.json";

const db = new sqlite3.Database('db/main.db', (err) => {
  if (err) console.error('error connecting to db', err.message);
});

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy({
      clientID: client_secret.web.client_id,
      clientSecret: client_secret.web.client_secret,
      callbackURL: "https://lifu.ddns.net/api/hentai-stalker/auth/google/redirect",
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        db.run(
          `INSERT OR IGNORE INTO Users (UserId, Email, PictureUrl, Name, AddedTime)
          VALUES (?, ?, ?, ?, DATETIME('now'));`, [
          profile.id,
          profile.emails[0].value.toLowerCase(),
          profile.photos[0].value,
          profile.displayName
        ], (err) => {
          console.log("User logged in", profile.emails[0]);
          return done(err, {
            id: profile.id,
            email: profile.emails[0].value.toLowerCase(),
            pictureUrl: profile.photos[0].value,
            name: profile.displayName
          });
        });
      } catch (err) {
        return done(err, null);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    db.get(`SELECT * FROM Users WHERE UserId = ?`, [id],
      (err, user: any) => done(err, {
        id: user.UserId,
        email: user.Email,
        name: user.Name,
        pictureUrl: user.PictureUrl
      }));
  });
};