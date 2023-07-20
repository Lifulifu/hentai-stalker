import express, { type Request, type Response, type NextFunction } from "express";
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import clientSecret from "../client_secret.json";
import sqlite3 from "sqlite3";
import { createUsersTable } from "./db";

const app = express();
app.use(express.json());
const client = new OAuth2Client();
const db = new sqlite3.Database('db/main.db', (err) => {
  if (err) console.error('error connecting to db', err.message);
});

async function isInWhitelist(db: sqlite3.Database, email: string) {
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

async function verifyUser(token: string): Promise<TokenPayload | null> {
  // Must pass google auth and is in whitelist
  let payload: TokenPayload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientSecret['web']['client_id']
    });
    payload = ticket.getPayload();
  } catch (e) {
    console.error("User verification failed");
    return null;
  }
  if (!payload) return null;
  const valid = await isInWhitelist(db, payload.email);
  if (!valid) return null;
  return payload;
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const userData = await verifyUser(req.body.token);
  if (!userData) {
    res.status(403).json({ error: "User verification failed" });
    return;
  };
  next();
}

app.use('/hentai-stalker', express.static('../client'));

app.post('/hentai-stalker/auth', async (req, res) => {
  const userData = await verifyUser(req.body.token);
  if (!userData) {
    res.status(403).json({ error: "User verification failed" });
    return;
  };

  db.run(`
    REPLACE INTO Users (UserId, Email, PictureUrl, Name, DateAdded)
    VALUES (?, ?, ?, ?, CURRENT_DATE);`,
    [userData.sub, userData.email.toLowerCase(), userData.picture, userData.name],
    (err) => {
      if (err) console.error('error adding user', userData);
    }
  );

  res.status(200).json({ user: userData });
});

app.listen(8034, () => console.log('Server is running on port 8034'));