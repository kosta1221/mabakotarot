import fs from "fs";
import { uploadFileToS3 } from "../s3/utils";

import { retry } from "./retry";
import { timeout } from "./sleep";

import Headline from "../db/models/Headline";
import { getRoundedDownDateByMinutesInterval } from "./luxon/screenshot-date-format";
import { scrapeTextsFromSite } from "./scrape-texts";
import { getLastHeadlineOfSite } from "../db/utils";
import { getDiffFromUrlAndPath } from "./image-diff/image-diff";
import { logRed } from "./console";

export const scrapePromises = (browser, ...sites) => {
  return sites.map((site) => {
    return retry(5, scrapePromiseForSite, browser, site);
  });
};

const scrapePromiseForSite = async (browser, site) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = await browser.newPage();

      try {
        await page.goto(site.url, {
          waitUntil: ["networkidle2"],
          timeout: 20000,
        });
      } catch (error) {
        if (page) {
          await page.close();
        }
        logRed(`Site loading error for: ${site.folder}`);
        throw error;
      }

      if (Number(process.env.TIMEOUT_AFTER_NAVIGATION_IN_SECONDS) > 0) {
        console.log(
          `page loaded for ${site.folder}, now sleeping for ${process.env.TIMEOUT_AFTER_NAVIGATION_IN_SECONDS} seconds...`
        );
        await timeout(Number(process.env.TIMEOUT_AFTER_NAVIGATION_IN_SECONDS) * 1000);
        console.log("finished sleep.");
      }

      let scrapedTextsFromSite;
      try {
        scrapedTextsFromSite = await scrapeTextsFromSite(site, page, true, 3);
        logRed(`got texts from: ${site.folder}`);
      } catch (error) {
        if (page) {
          await page.close();
        }
        logRed(`No texts scraped from: ${site.folder}`);
        throw error;
      }

      if (site.folder === "haaretz") {
        try {
          await page.click(site.popUpSelector);
        } catch (error) {
          console.log(error);
          console.log(`couldn't close popup on ${site.folder}, continuing without throwing...`);
        }
      }

      const roundedDownDateByMinutesInterval = getRoundedDownDateByMinutesInterval(
        Number(process.env.DESIRED_INTERVAL)
      );
      const fileNameBasedOnDate = roundedDownDateByMinutesInterval.toFormat("yyyy-MM-dd_HH-mm");
      const dateForDb = roundedDownDateByMinutesInterval.toFormat("yyyy-MM-dd HH:mm");
      const path = `/tmp/${site.folder}_${fileNameBasedOnDate}.png`;

      try {
        await page.screenshot({
          path,
        });
      } catch (error) {
        if (page) {
          await page.close();
        }
        logRed(`Couldn't take a screenshot from: ${site.folder}`);
        throw error;
      }

      if (page) {
        await page.close();
      }

      resolve({
        path,
        fileName: fileNameBasedOnDate,
        date: dateForDb,
        site: site.folder,
        ...scrapedTextsFromSite,
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const uploadToS3AndMongoPromises = (scrapedHeadlinesChecked) => {
  return scrapedHeadlinesChecked.map(
    (scrapedHeadlineChecked) =>
      new Promise(async (resolve, reject) => {
        try {
          const foundHeadline = await Headline.findOne({
            fileName: scrapedHeadlineChecked.fileName,
            site: scrapedHeadlineChecked.site,
          });

          if (!foundHeadline) {
            const S3URL = await uploadFileToS3(
              scrapedHeadlineChecked.path,
              `${scrapedHeadlineChecked.site}/${scrapedHeadlineChecked.fileName}.webp`
            );

            const newHeadline = await Headline.create({
              imageUrl: S3URL,
              fileName: scrapedHeadlineChecked.fileName,
              date: scrapedHeadlineChecked.date,
              site: scrapedHeadlineChecked.site,
              titleText: scrapedHeadlineChecked.titleText,
              subtitleText: scrapedHeadlineChecked.subtitleText,
              titleArticleLink: scrapedHeadlineChecked.titleArticleLink,
              isTextUnique: scrapedHeadlineChecked.isTextUnique,
              diffToLastOfSite: scrapedHeadlineChecked.diffToLastOfSite,
            });

            fs.unlinkSync(scrapedHeadlineChecked.path);

            resolve({ ...newHeadline, found: false });
          } else {
            fs.unlinkSync(scrapedHeadlineChecked.path);

            resolve({ ...foundHeadline, found: true });
          }
        } catch (error) {
          reject(error);
        }
      })
  );
};

export const checkAreScrapedHeadlinesUnique = (scrapedHeadlines) => {
  return scrapedHeadlines.map(
    (scrapedHeadline) =>
      new Promise(async (resolve, reject) => {
        try {
          let isTextUnique = true;

          const lastFoundHeadlineOfSite = await getLastHeadlineOfSite(scrapedHeadline.site);

          if (lastFoundHeadlineOfSite) {
            if (lastFoundHeadlineOfSite.titleText === scrapedHeadline.titleText) {
              isTextUnique = false;
            }

            const { diffPercentage } = await getDiffFromUrlAndPath(
              lastFoundHeadlineOfSite.imageUrl,
              scrapedHeadline.path
            );

            console.log(
              "\x1b[32m\x1b[40m%s\x1b[0m",
              `${scrapedHeadline.site}/${scrapedHeadline.fileName}: is text unique? - ${isTextUnique}. Image diff to last headline of ${scrapedHeadline.site}: ${diffPercentage}`
            );

            resolve({ ...scrapedHeadline, isTextUnique, diffToLastOfSite: diffPercentage });
          } else {
            console.log(
              "\x1b[32m\x1b[40m%s\x1b[0m",
              `${scrapedHeadline.site}/${scrapedHeadline.fileName}: is text unique? - ${isTextUnique}. Last headline of ${scrapedHeadline.site} not found.`
            );

            resolve({ ...scrapedHeadline, isTextUnique });
          }
        } catch (error) {
          reject(error);
        }
      })
  );
};
