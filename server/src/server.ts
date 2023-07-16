import express from "express";


const app = express();

app.use(express.json());

app.use('/hentai-stalker', express.static('../client'));

app.listen(8034, () => console.log('Server is running on port 8034'));