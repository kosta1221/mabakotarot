import dotenv from "dotenv";
dotenv.config();
import { logBlue, logGreen, logPurple, logRed } from "./utils/console";
import { connectToMongo, disconnectFromMongo } from "./db/mongo-connection";
import { launchBrowser, closeBrowser } from "./puppeteer/utils";
import { n12, ynet, haaretz, walla, israelhayom, news13 } from "./sites/index";
import { retryWithTimeOut } from "./utils/retry";
import {
  scrapePromises,
  uploadToS3AndMongoPromises,
  checkAreScrapedHeadlinesUnique,
} from "./utils/scraper-utils";

const sites = [haaretz, walla, n12, ynet, israelhayom];

const main = async (browser: any, ...sites: any[]) => {
  logPurple(`trying to scrape headlines from: ${sites.map((site) => site.folder).toString()}...`);

  let scraperHeadlines: any[];
  try {
    scraperHeadlines = await Promise.all(scrapePromises(browser, ...sites));

    logBlue("finished scraping headlines, trying to check scraped headlines' uniqueness...");
  } catch (error) {
    logRed("error in main: ", error);
    throw error;
  }

  let scraperHeadlinesChecked: any[];
  try {
    scraperHeadlinesChecked = await Promise.all(checkAreScrapedHeadlinesUnique(scraperHeadlines));
    logBlue("finished checking scraped headlines' uniqueness, trying to upload to s3 and db...");
  } catch (error) {
    logRed("error in main: ", error);
    throw error;
  }

  let newHeadlines: any[];
  try {
    newHeadlines = await Promise.all(uploadToS3AndMongoPromises(scraperHeadlinesChecked));
  } catch (error) {
    logRed("error in main: ", error);
    throw error;
  }

  const foundHeadlineDocs = newHeadlines.filter((headline: { found: any }) => headline.found);
  const notFoundHeadlineDocs = newHeadlines.filter((headline: { found: any }) => !headline.found);

  logBlue(
    `finished uploading phase, ${
      notFoundHeadlineDocs.length > 0
        ? `uploaded ${notFoundHeadlineDocs.length} items`
        : "no upload necessary."
    }`
  );

  console.log("Number of already existing headline docs in DB: ", foundHeadlineDocs.length);
  console.log("Number of new headline docs in DB: ", notFoundHeadlineDocs.length);

  logGreen(
    `done, ${
      notFoundHeadlineDocs.length > 0
        ? `check database for ${notFoundHeadlineDocs.length} new entries.`
        : "no new entries."
    }`
  );
};

export const lambdaHandler = async (event?: any) => {
  console.log("event: ", event);

  const split =
    process.env.SPLIT && sites.length % Number(process.env.SPLIT) === 0
      ? Number(process.env.SPLIT)
      : sites.length;
  const sitesAtATime = sites.length / split;

  try {
    console.log("Launching in headless mode? -", process.env.IS_HEADLESS);
    const browser = await retryWithTimeOut(5000, 5, launchBrowser);

    logBlue("launched browser successfully.");

    await connectToMongo();

    for (let i = 0; i < split; i++) {
      await retryWithTimeOut(
        Number(process.env.RETRY_TIMEOUT_FOR_MAIN_IN_SECONDS) * 1000,
        3,
        main,
        browser,
        ...sites.filter(
          (site, siteIndex) =>
            siteIndex < sitesAtATime * (i + 1) && siteIndex > sitesAtATime * i - 1
        )
      );
    }

    await closeBrowser(browser);
    logBlue("closed browser successfully.");

    await disconnectFromMongo();
    logBlue("disconnected from mongo successfully.");
    logGreen("finished scraping from all sites!");
  } catch (error) {
    logRed("SCRIPT UNSUCCESSFULL, EXITING WITH CODE 1");
    process.exit(1);
  }
};
