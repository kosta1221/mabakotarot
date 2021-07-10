require("dotenv").config();
const chromium = require("chrome-aws-lambda");
const { addExtra } = require("puppeteer-extra");
const puppeteerExtra = addExtra(chromium.puppeteer);
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteerExtra.use(AdblockerPlugin());

const launchBrowser = async () => {
	const browser = await puppeteerExtra.launch({
		args: chromium.args,
		defaultViewport: { width: 1536, height: 754 },
		executablePath: await chromium.executablePath,
		headless: true,
	});

	return browser;
};

const closeBrowser = async (browser) => {
	browser.close();
};

module.exports = { launchBrowser, closeBrowser };
