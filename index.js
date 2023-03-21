import puppeteer from "puppeteer";
import fs from "fs";

function textContent(el) {
  return el.textContent.trim();
}

const url = "https://www.choice-motorcar.com/inventory.aspx?limit=999";
async function scrapeInventory(url) {
  const inventory = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  page.on("request", (req) => {
    if (
      req.resourceType() === "image" ||
      req.resourceType() === "stylesheet" ||
      req.resourceType() === "font" ||
      req.resourceType() === "script"
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });
  const startTime = Date.now();

  await page.goto(url, { waitUntil: "networkidle2" });
  const metrics = await page.metrics();

  const productstSelector = "#products";
  await page.waitForSelector(productstSelector);
  const inventoryItems = await page.$$("#products .invItems");
  for (const item of inventoryItems) {
    const modelYear = await item.$eval(
      "span[itemprop='vehicleModelDate']",
      textContent
    );
    const make = await item.$eval("span[itemprop='manufacturer']", textContent);
    const model = await item.$eval("span[itemprop='model']", textContent);
    const thumbnail = await item.$eval("img[itemprop='image']", (el) =>
      el.getAttribute("content").trim()
    );
    const trim = await item.$eval(
      "span[itemprop='vehicleConfiguration']",
      textContent
    );
    const url = await item.$eval(".listitemlink", (el) => el.href.trim());

    const vin = await item.$eval(
      'span[itemprop="vehicleIdentificationNumber"]',
      textContent
    );
    inventory.push({ modelYear, make, model, trim, url, vin, thumbnail });
  }
  await browser.close();

  const endTime = Date.now();
  const timeTaken = endTime - startTime;
  console.log(`Scraped ${inventory.length} items in ${timeTaken} ms`);

  return inventory;
}

scrapeInventory(url)
  .then((inventory) => {
    const jsonData = JSON.stringify(inventory, null, 2);
    fs.writeFileSync("inventory.json", jsonData);
  })
  .catch((err) => console.error(err));
