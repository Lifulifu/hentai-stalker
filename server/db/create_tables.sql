-- SQLite
-- CREATE TABLE Users (
--   UserId TEXT PRIMARY KEY,
--   Email TEXT,
--   PictureUrl TEXT,
--   Name TEXT,
--   AddedTime DATETIME
-- );

DROP TABLE Keywords;
CREATE TABLE Keywords (
  UserId TEXT,
  Keyword TEXT,
  KeywordId TEXT,
  AddedTime DATETIME,
  FOREIGN KEY(UserId) REFERENCES Users(UserId)
);

-- DROP TABLE Galleries;
-- CREATE TABLE Galleries (
--   UserId TEXT,
--   SearchBatchId INT,
--   Url TEXT,
--   ThumbUrl TEXT,
--   Title TEXT,
--   AddedTime DATETIME,
--   FOREIGN KEY(UserId) REFERENCES Users(UserId)
-- );

-- DROP TABLE WhiteList;
-- CREATE TABLE Whitelist (
--   Email TEXT PRIMARY KEY,
--   AddedTime DATETIME
-- );