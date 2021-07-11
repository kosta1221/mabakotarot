require("dotenv").config();
const chromium = require("chrome-aws-lambda");
const { addExtra } = require("puppeteer-extra");
const puppeteerExtra = addExtra(chromium.puppeteer);
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const fs = require("fs");
puppeteerExtra.use(AdblockerPlugin());

const launchBrowser = async () => {
	// LiberationSans for walla
	await chromium.font("https://rawcdn.githack.com/shantigilbert/liberation-fonts-ttf/ef7161f03e305982b0b247e9a0b7cc472376dd83/LiberationSans-Regular.ttf");
	await chromium.font("https://rawcdn.githack.com/shantigilbert/liberation-fonts-ttf/ef7161f03e305982b0b247e9a0b7cc472376dd83/LiberationSans-Bold.ttf");
	await chromium.font("https://rawcdn.githack.com/shantigilbert/liberation-fonts-ttf/ef7161f03e305982b0b247e9a0b7cc472376dd83/LiberationSans-Italic.ttf");
		// Almoni for News13 (lesser odds of working)
	await chromium.font("https://13news.co.il/wp-content/themes/reshet_tv/build/assets/fonts/Almoni/almoni-dl-aaa-300.woff");
	await chromium.font("https://13news.co.il/wp-content/themes/reshet_tv/build/assets/fonts/Almoni/almoni-dl-aaa-400.woff");
	await chromium.font("https://13news.co.il/wp-content/themes/reshet_tv/build/assets/fonts/Almoni/almoni-dl-aaa-700.woff");

	const executablePath = await chromium.executablePath;
	console.log("\x1b[35m%s\x1b[0m", `executable path: ${executablePath}`);

	const browser = await puppeteerExtra.launch({
		args: chromium.args,
		defaultViewport: { width: 1536, height: 754 },
		executablePath,
		headless: true,
	});

	return browser;
};

const closeBrowser = async (browser) => {
	browser.close();
};

module.exports = { launchBrowser, closeBrowser };
