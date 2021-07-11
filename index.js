require("dotenv").config();
const { connectToMongo, disconnectFromMongo } = require("./db/mongo-connection");
const { launchBrowser, closeBrowser } = require("./puppeteer/utils");
const { n12, ynet, haaretz, walla, israelhayom, news13 } = require("./sites/index");

const { retryWithTimeOut } = require("./utils/retry");

const {
	scrapePromises,
	uploadToS3AndMongoPromises,
	checkAreScrapedHeadlinesUnique,
} = require("./utils/scraper-utils");

const main = async () => {
	console.log("Launching in headless mode? -", process.env.IS_HEADLESS);

	let browser;
	try {
		browser = await launchBrowser();

		console.log("\x1b[36m%s\x1b[0m", "launched browser successfully.");

		await connectToMongo();
	} catch (error) {
		console.log("\x1b[31m%s\x1b[0m", "error in main: ", error);
		throw error;
	}

	let scraperHeadlines;
	try {
		scraperHeadlines = await Promise.all(
			scrapePromises(browser, walla, haaretz, n12, ynet, israelhayom, news13)
		);
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

	await closeBrowser(browser);
	console.log("\x1b[36m%s\x1b[0m", "closed browser successfully.");

	try {
		await disconnectFromMongo();
	} catch (error) {
		console.log("disconnect error");
		console.log("\x1b[31m%s\x1b[0m", "error in main: ", error);
	}
	console.log("\x1b[36m%s\x1b[0m", "disconnected from mongo successfully.");

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
	try {
		await retryWithTimeOut(5000, 3, main);
	} catch (error) {
		console.log("\x1b[31m%s\x1b[0m", "SCRIPT UNSUCCESSFULL, EXITING WITH CODE 1");
		process.exit(1);
	}
};
