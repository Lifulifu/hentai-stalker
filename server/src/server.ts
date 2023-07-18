import express, { type Request, type Response, type NextFunction } from "express";
import { OAuth2Client } from 'google-auth-library';
import clientSecret from "../client_secret.json";

const client = new OAuth2Client();

const app = express();

app.use(express.json());

app.use('/hentai-stalker', express.static('../client'));

async function verifyUser(req: Request, res: Response, next: NextFunction) {
  let payload;
  try {
    const token = req.body.token;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientSecret['web']['client_id']
    });
    payload = ticket.getPayload();
  } catch (e) {
    console.log("User verification failed");
    res.status(403).json({ error: "User verification failed" });
  }

  if (!payload) {
    res.status(403).json({ error: "User verification failed" });
    return;
  };

  next();
}

app.post('/hentai-stalker/auth', async (req, res) => {
  let payload;
  try {
    const token = req.body.token;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientSecret['web']['client_id']
    });
    payload = ticket.getPayload();
  } catch (e) {
    console.log("User verification failed");
    res.status(403).json({ error: "User verification failed" });
  }

  if (!payload) {
    res.status(403).json({ error: "User verification failed" });
    return;
  };

  res.status(200).json({ user: payload });
});

app.listen(8034, () => console.log('Server is running on port 8034'));