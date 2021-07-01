require("dotenv").config();

const { uploadFileToS3 } = require("../s3/utils");

const { retry } = require("../utils/retry");

const Headline = require("../db/models/Headline");
const getRoundedDownDateByMinutesInterval = require("../screenshot-date-format");
const scrapeTextsFromSite = require("../scrape-texts");

const scrapePromises = (browser, ...sites) => {
	return sites.map((site) => {
		return retry(3, scrapePromiseForSite, browser, site);
	});
};

const scrapePromiseForSite = async (browser, site) => {
	return new Promise(async (resolve, reject) => {
		try {
			const page = await browser.newPage();
			await page.goto(site.url, {
				waitUntil: ["networkidle0", "load"],
				timeout: 0,
			});

			let scrapedTextsFromSite;
			try {
				scrapedTextsFromSite = await scrapeTextsFromSite(site, page, true, 3);
			} catch (error) {
				console.log(`No texts scraped from: ${site.folder}`);
				throw error;
			}

			const roundedDownDateByMinutesInterval = getRoundedDownDateByMinutesInterval(
				process.env.DESIRED_INTERVAL
			);
			const fileNameBasedOnDate = roundedDownDateByMinutesInterval.toFormat("yyyy-MM-dd_HH-mm");
			const dateForDb = roundedDownDateByMinutesInterval.toFormat("yyyy-MM-dd HH:mm");
			const path = `./headlines/${site.folder}/${fileNameBasedOnDate}.png`;
			await page.screenshot({
				path,
			});

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

const uploadToS3AndMongoPromises = (scrapedHeadlines) => {
	return scrapedHeadlines.map(
		(scrapedHeadline) =>
			new Promise(async (resolve, reject) => {
				try {
					const foundHeadline = await Headline.findOne({
						fileName: scrapedHeadline.fileName,
						site: scrapedHeadline.site,
					});

					if (!foundHeadline) {
						const S3URL = await uploadFileToS3(
							scrapedHeadline.path,
							scrapedHeadline.path.slice(12).replace("png", "webp")
						);

						const newHeadline = await Headline.create({
							imageUrl: S3URL,
							fileName: scrapedHeadline.fileName,
							date: scrapedHeadline.date,
							site: scrapedHeadline.site,
							titleText: scrapedHeadline.titleText,
							subtitleText: scrapedHeadline.subtitleText,
							titleArticleLink: scrapedHeadline.titleArticleLink,
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

module.exports = { scrapePromises, uploadToS3AndMongoPromises };
