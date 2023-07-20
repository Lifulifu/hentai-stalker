import sqlite3 from "sqlite3";

export function createGalleryTable(db: sqlite3.Database) {
  db.run(`
    CREATE TABLE Galleries (
      SearchBatchId INT,
      Url TEXT,
      ThumbUrl TEXT,
      Title TEXT
      DateAdded DATE,
    );
  `, (err) => {
    if (err) console.error('error creating table', err.message);
  });
}

export async function createKeywordsTable(db: sqlite3.Database) {
  db.run(`
    CREATE TABLE Keywords (
      UserId INT,
      Keyword TEXT,
      DateAdded DATE,
      FOREIGN KEY(UserId) REFERENCES Users(UserId)
    );
  `, (err) => {
    if (err) console.error('error creating table', err.message);
  });
}

export async function createUsersTable(db: sqlite3.Database) {
  // UserId is google tokenPayload's 'sub' field
  db.run(`
    CREATE TABLE Users (
      UserId TEXT PRIMARY KEY,
      Email TEXT,
      PictureUrl TEXT,
      Name TEXT,
      DateAdded DATE
    );
  `, (err) => {
    if (err) console.error('error creating table', err.message);
  });
}
