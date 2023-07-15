import puppeteer, { Browser } from "puppeteer";

async function getSearchResult(browser: Browser, query: string) {
  // front page, type query and submit search
  const page = await browser.newPage();
  await page.goto('https://e-hentai.org/');
  const searchInput = await page.waitForSelector('#f_search');
  await searchInput?.type(query);
  await page.click('input[type="submit"][value="Search"');

  // parse search result
  const searchResultSelector = '.searchnav ~ table tr';
  await page.waitForSelector(searchResultSelector, { timeout: 5000 });
  const trs = Array.from(await page.$$(searchResultSelector));
  const res = await Promise.allSettled(trs.map((tr) => tr.$eval('td.gl3c a', (el) => el?.href)));
  return res.map(r => (r.status === "fulfilled" ? r.value : null)).filter(r => (r != null));
}

async function run() {
  const browser = await puppeteer.launch();
  const resultUrls = await getSearchResult(browser, 'irotenya');
  await browser.close();
}

run();