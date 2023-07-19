import sqlite3 from "sqlite3";

export function createGalleryTable(db: sqlite3.Database) {
  db.run(`
    CREATE TABLE Galleries (
      SearchBatchId INT,
      DateAdded DATE,
      Url TEXT,
      ThumbUrl TEXT,
      Title TEXT
    );
  `, (err) => {
    if (err) console.error('error creating table', err.message);
  });
}

export async function createKeywordsTable(db: sqlite3.Database) {
  db.run(`
    CREATE TABLE Keywords (
      DateAdded DATE,
      UserId INT,
      Keyword TEXT,
      FOREIGN KEY(UserId) REFERENCES Users(UserId)
    );
  `, (err) => {
    if (err) console.error('error creating table', err.message);
  });
}

export async function createUsersTable(db: sqlite3.Database) {
  db.run(`
    CREATE TABLE Users (
      UserId INT AUTO_INCREMENT PRIMARY KEY,
      DateAdded DATE,
      Email TEXT,
      PictureUrl TEXT,
      Name TEXT
    );
  `, (err) => {
    if (err) console.error('error creating table', err.message);
  });
}
