import puppeteer, { Browser } from "puppeteer";
import sqlite3 from "sqlite3";
import fs from 'fs';

interface GalleryMetaData {
  gid: number, // 525116,
  token: string, // 'f357c92bd9',
  archiver_key: string, // '469384--42e46df4f3e31719e0eedd40a609d76df71055e9',
  title: string, // '- Artist - Ronna',
  title_jpn: string, // '',
  category: string, // 'Image Set',
  thumb: string, // 'https://ehgt.org/d7/5c/d75c15273b68b328341345d85a63bca5e7c5a8e1-508244-1066-800-jpg_l.jpg',
  uploader: string, // 'taiko101',
  posted: string; // '1347299055',
  filecount: string; // '30',
  filesize: number, // 21521655,
  expunged: boolean, // false,
  rating: string, // '4.05',
  torrentcount: string, // '0',
  torrents: any[], // [],
  tags: string[]; // [Array]
}

const db = new sqlite3.Database('db/main.db', (err) => {
  if (err) console.error('error connecting to db', err.message);
});

async function getGalleryUrlsByKeyword(browser: Browser, query: string): Promise<string[]> {
  // go to search result page
  const page = await browser.newPage();
  await page.goto(encodeURI(`https://e-hentai.org/?f_search=${query}`));

  // parse urls from search result table rows (only 1st page)
  const searchResultSelector = '.searchnav ~ table tr';
  try {
    await page.waitForSelector(searchResultSelector, { timeout: 5000 });
  } catch (e) {
    console.log("Failed to get galleries from keyword", query, e);
    return [];
  }
  const urls = await page.evaluate((searchResultSelector: string) => {
    const trs = Array.from(document.querySelectorAll(searchResultSelector)) as HTMLTableRowElement[];
    return trs.map((tr) => {
      const atag = tr.querySelector('td.gl3c a') as HTMLAnchorElement | null;
      return atag ? atag.href : null;
    }).filter(url => url); // drop null values and empty string
  }, searchResultSelector);

  await page.close();
  return urls as string[];
}

async function getGalleryData(url: string): Promise<{ gmetadata: GalleryMetaData[]; }> {
  const apiUrl = 'https://api.e-hentai.org/api.php';
  const match = url.match(/e-hentai\.org\/g\/(\w+)\/(\w+)/);
  if (!match || match.length <= 2) return null;
  const [_, id, token] = match;
  const res = await fetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({
      method: "gdata",
      gidlist: [[id, token]],
      namespace: 1
    })
  });
  return res.json();
}

async function runAllKeywords(browser: Browser) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT UserId FROM Keywords`,
      async (err, rows: any) => {
        if (err) {
          console.log("Failed to get all users", err);
          reject(err);
        }
        for (let row of rows) {
          console.log("running for user", row.UserId);
          if (row.UserId) await runAllKeywordsForUser(browser, row.UserId);
        }
        resolve(null);
      });
  });
}

async function runAllKeywordsForUser(browser: Browser, userId: string) {
  // get all keywords from user
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // delete any previous galleries for that user
      db.run(`DELETE FROM Galleries WHERE UserId = ?`, [userId],
        (err) => {
          if (err) {
            console.log("Failed to delete outdated user galleries.");
            reject(err);
          }
        });

      // get user's keywords, perform search and save to Galleries
      db.all(
        `SELECT Keyword FROM Keywords WHERE UserId = ?`, [userId],
        async (err, rows: any) => {
          if (err) {
            console.log("Failed to select keywords from", userId);
            reject(err);
          }
          for (let row of rows) {
            if (row.Keyword) await runKeyword(browser, userId, row.Keyword);
          }
          resolve(null);
        });
    });
  });
}

async function runKeyword(browser: Browser, userId: string, keyword: string) {
  // get gallery urls from search result
  const resultUrls = await getGalleryUrlsByKeyword(browser, keyword);
  if (resultUrls.length === 0) return;

  // get gallery data from urls
  const galleryData: ({ url: string; } & GalleryMetaData)[] = [];
  let data;
  try {
    for (const resultUrl of resultUrls) {
      data = await getGalleryData(resultUrl);
      if (data.gmetadata[0]) galleryData.push({ url: resultUrl, ...data.gmetadata[0] });
    }
  } catch (e) {
    console.error('failed to get gallery data', e, data);
  }

  // write gallery data to DB
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    const insertQuery = `
      INSERT INTO Galleries (UserId, Keyword, Url, ThumbUrl, Title, PostedTime, AddedTime)
      VALUES (?, ?, ?, ?, ?, DATETIME(?, 'unixepoch'), DATETIME('NOW'));`;
    for (const data of galleryData) {
      db.run(insertQuery, [userId, keyword, data.url, data.thumb, data.title, data.posted], (err) => {
        if (err) console.error('error inserting data', err.message);
      });
    }
    db.run('COMMIT');
  });

}

export async function runScraper(isManual: boolean, userId: string = null) {
  fs.appendFileSync('./scraper_history.log', `--- [${new Date()}][${isManual ? 'manual' : 'scheduled'}] Running scraper ---\n`);
  const browser = await puppeteer.launch({ headless: 'new' });
  if (userId) await runAllKeywordsForUser(browser, userId);
  else await runAllKeywords(browser);
  await browser.close();
  fs.appendFileSync('./scraper_history.log', `--- [${new Date()}] End ---\n\n`);
}