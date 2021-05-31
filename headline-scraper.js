const puppeteer = require("puppeteer-extra");

const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin());

const scrapeHeadline = async () => {
	const browser = await puppeteer.launch({
		headless: false,
		args: ["--disable-web-security"],
		slowMo: 50,
	});

	await Promise.all(scrapePromises(browser, "https://www.n12.co.il/", "https://www.ynet.co.il"));

	console.log("done, check screenshot");
	await browser.close();
};

const scrapePromises = (browser, ...urls) => {
	return urls.map(
		(url, i) =>
			new Promise(async (resolve, reject) => {
				try {
					const page = await browser.newPage();
					await page.goto(url, { waitUntil: "networkidle0" });
					await page.screenshot({ path: `./headlines/screenshot${i}.png` });
					resolve();
				} catch (error) {
					reject(error);
				}
			})
	);
};

scrapeHeadline();
