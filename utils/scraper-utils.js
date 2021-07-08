require("dotenv").config();
const fs = require("fs");
const { uploadFileToS3 } = require("../s3/utils");

const { retry } = require("../utils/retry");

const Headline = require("../db/models/Headline");
const getRoundedDownDateByMinutesInterval = require("../screenshot-date-format");
const scrapeTextsFromSite = require("../scrape-texts");
const { getLastHeadlineOfSite } = require("../db/utils");
const { getDiffFromUrlAndPath } = require("../image-diff");

const scrapePromises = (browser, ...sites) => {
	return sites.map((site) => {
		return retry(3, scrapePromiseForSite, browser, site);
	});
};

const scrapePromiseForSite = async (browser, site) => {
	return new Promise(async (resolve, reject) => {
		try {
			const page = await browser.newPage();

			try {
				await page.goto(site.url, {
					waitUntil: ["domcontentloaded"],
					timeout: 15000,
				});
			} catch (error) {
				if (page) {
					page.close();
				}
				console.log("\x1b[31m%s\x1b[0m", `Site loading error for: ${site.folder}`);
				throw error;
			}

			let scrapedTextsFromSite;
			try {
				scrapedTextsFromSite = await scrapeTextsFromSite(site, page, true, 3);
				console.log("\x1b[31m%s\x1b[0m", `got texts from: ${site.folder}`);
			} catch (error) {
				if (page) {
					page.close();
				}
				console.log("\x1b[31m%s\x1b[0m", `No texts scraped from: ${site.folder}`);
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
				process.env.DESIRED_INTERVAL
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
					page.close();
				}
				console.log("\x1b[31m%s\x1b[0m", `Couldn't take a screenshot from: ${site.folder}`);
				throw error;
			}

			if (page) {
				page.close();
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

const uploadToS3AndMongoPromises = (scrapedHeadlinesChecked) => {
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
							scrapedHeadlineChecked.path.slice(12).replace("png", "webp")
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

const checkAreScrapedHeadlinesUnique = (scrapedHeadlines) => {
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

module.exports = { scrapePromises, uploadToS3AndMongoPromises, checkAreScrapedHeadlinesUnique };
