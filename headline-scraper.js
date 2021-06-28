require("dotenv").config();
const puppeteer = require("puppeteer-extra");
const { uploadFileToS3 } = require("./s3/utils");
const {
  connectToMongo,
  disconnectFromMongo,
} = require("./db/mongo-connection");
const Headline = require("./db/models/Headline");
const getRoundedDownDateByMinutesInterval = require("./screenshot-date-format");
const scrapeTextsFromSite = require("./scrape-texts");

const { n12, ynet } = require("./sites/index");

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin());

const scrapeHeadline = async () => {
  console.log("Launching in headless mode? -", process.env.IS_HEADLESS);

  const browser = await puppeteer.launch({
    headless: process.env.IS_HEADLESS === "false" ? false : true,
    defaultViewport:
      process.env.IS_HEADLESS === "false" ? null : { width: 1536, height: 754 },
    args: ["--disable-web-security", "--start-maximized"],
    slowMo: process.env.IS_HEADLESS === "false" ? 50 : 0,
  });

  await connectToMongo();

  const newHeadlines = await Promise.all(scrapePromises(browser, n12, ynet));
  const foundHeadlineDocs = newHeadlines.filter((headline) => headline.found);
  const notFoundHeadlineDocs = newHeadlines.filter(
    (headline) => !headline.found
  );
  console.log(
    "Number of already existing headline docs in DB: ",
    foundHeadlineDocs.length
  );
  console.log(
    "Number of new headline docs in DB: ",
    notFoundHeadlineDocs.length
  );

  await browser.close();
  await disconnectFromMongo();
  console.log("done, check database for new entries.");
};

const scrapePromises = (browser, ...sites) => {
  return sites.map(
    (site, i) =>
      new Promise(async (resolve, reject) => {
        try {
          const page = await browser.newPage();
          await page.goto(site.url, {
            waitUntil: ["networkidle0", "load"],
            timeout: 0,
          });

          let scrapedTextsFromSite;
          try {
            scrapedTextsFromSite = await scrapeTextsFromSite(site, page);
          } catch (error) {
            console.log(`No texts scraped from: ${site.folder}`);
            console.log(error);
          }

          const roundedDownDateByMinutesInterval =
            getRoundedDownDateByMinutesInterval(process.env.DESIRED_INTERVAL);
          const fileNameBasedOnDate =
            roundedDownDateByMinutesInterval.toFormat("yyyy-MM-dd_HH-mm");
          const dateForDb =
            roundedDownDateByMinutesInterval.toFormat("yyyy-MM-dd HH:mm");
          const path = `./headlines/${site.folder}/${fileNameBasedOnDate}.png`;
          await page.screenshot({
            path,
          });

          const foundHeadline = await Headline.findOne({
            fileName: fileNameBasedOnDate,
            site: site.folder,
          });

          if (!foundHeadline) {
            const S3URL = await uploadFileToS3(path, path.slice(12).replace("png", "webp"));

            const newHeadline = await Headline.create({
              imageUrl: S3URL,
              fileName: fileNameBasedOnDate,
              date: dateForDb,
              site: site.folder,
              ...scrapedTextsFromSite,
            });

            resolve({ ...newHeadline, found: false });
          } else {
            resolve({ ...foundHeadline, found: true });
          }
        } catch (error) {
          reject(error);
        }
      })
  );
};

scrapeHeadline();
