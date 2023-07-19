import puppeteer, { Browser } from "puppeteer";
import sqlite3 from "sqlite3";
import { createGalleryTable, createKeywordsTable, createUsersTable } from "./db";

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

async function searchGalleryUrls(browser: Browser, query: string): Promise<string[]> {
  // front page, type query and submit search
  const page = await browser.newPage();
  await page.goto('https://e-hentai.org/');
  const searchInput = await page.waitForSelector('#f_search');
  await searchInput?.type(query);
  await page.click('input[type="submit"][value="Search"');

  // parse urls from search result table rows (only 1st page)
  const searchResultSelector = '.searchnav ~ table tr';
  await page.waitForSelector(searchResultSelector, { timeout: 5000 });
  const urls = await page.evaluate((searchResultSelector: string) => {
    const trs = Array.from(document.querySelectorAll(searchResultSelector)) as HTMLTableRowElement[];
    return trs.map((tr) => {
      const atag = tr.querySelector('td.gl3c a') as HTMLAnchorElement | null;
      return atag ? atag.href : null;
    }).filter(url => url); // drop null values and empty string
  }, searchResultSelector);

  page.close();
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

async function run() {
  // get gallery urls from search result
  const browser = await puppeteer.launch();
  const resultUrls = await searchGalleryUrls(browser, 'ronna');
  await browser.close();

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
  const db = new sqlite3.Database('db/main.db', (err) => {
    if (err) console.error('error connecting to db', err.message);
  });
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    createGalleryTable(db);
    const insertQuery = `
      INSERT INTO Galleries (Url, ThumbUrl, Title, DateAdded)
      VALUES (?, ?, ?, CURRENT_DATE);`;
    for (const data of galleryData) {
      db.run(insertQuery, [data.url, data.thumb, data.title], (err) => {
        if (err) console.error('error inserting data', err.message);
      });
    }
    db.run('COMMIT');
  });

  db.close();
}

run();