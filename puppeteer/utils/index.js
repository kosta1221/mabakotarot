require("dotenv").config();
const puppeteer = require("puppeteer-extra");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin());

const launchBrowser = async () => {
	const browser = await puppeteer.launch({
		headless: process.env.IS_HEADLESS === "false" ? false : true,
		defaultViewport: process.env.IS_HEADLESS === "false" ? null : { width: 1536, height: 754 },
		args: ["--disable-web-security", "--start-maximized", "--no-sandbox"],
		slowMo: process.env.IS_HEADLESS === "false" ? 50 : 0,
	});

	return browser;
};

const closeBrowser = async (browser) => {
	browser.close();
};

module.exports = { launchBrowser, closeBrowser };
