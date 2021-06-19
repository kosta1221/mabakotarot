require("dotenv").config();
const puppeteer = require("puppeteer-extra");
const uploadFileToS3 = require("./upload-to-s3");
const { connectToMongo, disconnectFromMongo } = require("./db/mongo-connection");
const Headline = require("./db/models/Headline");
const getRoundedDownDateByMinutesInterval = require("./screenshot-date-format");

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin());

const n12 = {
	url: "https://www.n12.co.il/",
	folder: "n12",
};

const ynet = {
	url: "https://www.ynet.co.il",
	folder: "ynet",
};

const scrapeHeadline = async () => {
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
		args: ["--disable-web-security", "--start-maximized"],
		slowMo: 50,
	});

	await connectToMongo();

	await Promise.all(scrapePromises(browser, n12, ynet));

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
					await page.goto(site.url, { waitUntil: "networkidle0" });

					const path = `./headlines/${site.folder}/${getRoundedDownDateByMinutesInterval(
						process.env.DESIRED_INTERVAL
					)}.png`;
					await page.screenshot({
						path,
					});

					const s3Url = await uploadFileToS3(path, path.slice(12));
					await Headline.create({ imageUrl: s3Url });

					resolve();
				} catch (error) {
					reject(error);
				}
			})
	);
};

scrapeHeadline();
