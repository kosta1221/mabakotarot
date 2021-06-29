const { connectToMongo, disconnectFromMongo } = require("./db/mongo-connection");
const { launchBrowser, closeBrowser } = require("./puppeteer/utils");
const { n12, ynet } = require("./sites/index");

const { scrapePromises, uploadToS3AndMongoPromises } = require("./utils/scraper-utils");

const main = async () => {
	console.log("Launching in headless mode? -", process.env.IS_HEADLESS);

	const browser = await launchBrowser();

	console.log("\x1b[36m%s\x1b[0m", "launched browser successfully.");

	await connectToMongo();

	const scraperHeadlines = await Promise.all(scrapePromises(browser, n12, ynet));
	console.log("\x1b[36m%s\x1b[0m", "finished scraping headlines, trying to upload to s3 and db...");

	const newHeadlines = await Promise.all(uploadToS3AndMongoPromises(scraperHeadlines));
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
		console.log(error);
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

main();
