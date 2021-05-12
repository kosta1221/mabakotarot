const puppeteer = require("puppeteer");

const scrapeHeadline = async () => {
	browser = await puppeteer.launch({
		headless: false,
		args: ["--disable-web-security"],
		slowMo: 50,
	});

	page = await browser.newPage();

	await page.goto("https://www.n12.co.il/", { waitUntil: "networkidle0" });
	await page.screenshot({ path: "./headlines/screenshot.png", fullPage: true });

	console.log("done, check screenshot");
	await browser.close();
};

scrapeHeadline();
