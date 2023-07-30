-- SQLite
-- DROP TABLE Users;
-- DROP TABLE Keywords;
DROP TABLE Galleries;
-- DROP TABLE WhiteList;

-- CREATE TABLE Users (
--   UserId TEXT PRIMARY KEY,
--   Email TEXT,
--   PictureUrl TEXT,
--   Name TEXT,
--   AddedTime DATETIME
-- );

-- CREATE TABLE Keywords (
--   UserId TEXT,
--   Keyword TEXT,
--   KeywordId TEXT,
--   AddedTime DATETIME,
--   FOREIGN KEY(UserId) REFERENCES Users(UserId)
-- );

CREATE TABLE Galleries (
  UserId TEXT,
  Keyword TEXT,
  Url TEXT,
  ThumbUrl TEXT,
  Title TEXT,
  PostedTime DATETIME,
  AddedTime DATETIME,
  FOREIGN KEY(UserId) REFERENCES Users(UserId)
);

-- CREATE TABLE Whitelist (
--   Email TEXT PRIMARY KEY,
--   AddedTime DATETIME
-- );