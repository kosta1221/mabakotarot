require("dotenv").config();
const { connectToMongo, disconnectFromMongo } = require("./db/mongo-connection");
const { launchBrowser, closeBrowser } = require("./puppeteer/utils");
const { n12, ynet, haaretz, walla, israelhayom, news13 } = require("./sites/index");

const { retryWithTimeOut } = require("./utils/retry");

const sites = [haaretz, walla, n12, ynet, israelhayom, news13];

const {
	scrapePromises,
	uploadToS3AndMongoPromises,
	checkAreScrapedHeadlinesUnique,
} = require("./utils/scraper-utils");

const main = async (browser, ...sites) => {
	console.log(
		"\x1b[35m%s\x1b[0m",
		`trying to scrape headlines from: ${sites.map((site) => site.folder).toString()}...`
	);

	let scraperHeadlines;
	try {
		scraperHeadlines = await Promise.all(scrapePromises(browser, ...sites));
		console.log(
			"\x1b[36m%s\x1b[0m",
			"finished scraping headlines, trying to check scraped headlines' uniqueness..."
		);
	} catch (error) {
		console.log("\x1b[31m%s\x1b[0m", "error in main: ", error);
		throw error;
	}

	let scraperHeadlinesChecked;
	try {
		scraperHeadlinesChecked = await Promise.all(checkAreScrapedHeadlinesUnique(scraperHeadlines));
		console.log(
			"\x1b[36m%s\x1b[0m",
			"finished checking scraped headlines' uniqueness, trying to upload to s3 and db..."
		);
	} catch (error) {
		console.log("\x1b[31m%s\x1b[0m", "error in main: ", error);
		throw error;
	}

	let newHeadlines;
	try {
		newHeadlines = await Promise.all(uploadToS3AndMongoPromises(scraperHeadlinesChecked));
	} catch (error) {
		console.log("\x1b[31m%s\x1b[0m", "error in main: ", error);
		throw error;
	}

	const foundHeadlineDocs = newHeadlines.filter((headline) => headline.found);
	const notFoundHeadlineDocs = newHeadlines.filter((headline) => !headline.found);

	console.log(
		"\x1b[36m%s\x1b[0m",
		`finished uploading phase, ${
			notFoundHeadlineDocs.length > 0
				? `uploaded ${notFoundHeadlineDocs.length} items`
				: "no upload necessary."
		}`
	);

	console.log("Number of already existing headline docs in DB: ", foundHeadlineDocs.length);
	console.log("Number of new headline docs in DB: ", notFoundHeadlineDocs.length);

	console.log(
		"\x1b[32m\x1b[40m%s\x1b[0m",
		`done, ${
			notFoundHeadlineDocs.length > 0
				? `check database for ${notFoundHeadlineDocs.length} new entries.`
				: "no new entries."
		}`
	);
};

exports.lambdaHandler = async (event) => {
	console.log("event: ", event);

	const split = sites.length % process.env.SPLIT === 0 ? process.env.SPLIT : sites.length;
	const sitesAtATime = sites.length / split;

	try {
		console.log("Launching in headless mode? -", process.env.IS_HEADLESS);
		const browser = await retryWithTimeOut(5000, 5, launchBrowser);

		console.log("\x1b[36m%s\x1b[0m", "launched browser successfully.");

		await connectToMongo();

		for (let i = 0; i < split; i++) {
			await retryWithTimeOut(
				5000,
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
		console.log("\x1b[36m%s\x1b[0m", "closed browser successfully.");

		await disconnectFromMongo();
		console.log("\x1b[36m%s\x1b[0m", "disconnected from mongo successfully.");
		console.log("\x1b[32m\x1b[40m%s\x1b[0m", "finished scraping from all sites!");
	} catch (error) {
		console.log("\x1b[31m%s\x1b[0m", "SCRIPT UNSUCCESSFULL, EXITING WITH CODE 1");
		process.exit(1);
	}
};
