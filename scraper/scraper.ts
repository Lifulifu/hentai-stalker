import puppeteer, { Browser } from "puppeteer";

async function searchGalleryUrls(browser: Browser, query: string) {
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
  return urls;
}

async function getGalleryData(url: string) {
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
  // const browser = await puppeteer.launch();
  // const resultUrls = await searchGalleryUrls(browser, 'irotenya');
  // await browser.close();
  const res = await getGalleryData('https://e-hentai.org/g/2075593/c50511e2f8/');
  console.log(res);
}

run();