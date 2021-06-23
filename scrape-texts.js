const scrapeTextsFromSite = async (site, page) => {
	switch (site.folder) {
		case "n12": {
			const titleText = await page.$eval(".has-caption > strong > a", (el) => el.innerText);

			const subTitleText = await page.$eval(".has-caption > span > a", (el) => el.innerText);

			const titleArticleLink = await page.$eval(".has-caption > strong > a", (el) =>
				el.getAttribute("href")
			);
			const checkedArticleLink = checkIfFullLink(titleArticleLink, site.url);

			return {
				titleText,
				subTitleText,
				titleArticleLink: checkedArticleLink,
			};
		}

		case "ynet": {
			const titleText = await page.$eval(".slotTitle > a > span", (el) => el.innerText);

			const subTitleText = await page.$eval(".slotSubTitle > a > span", (el) => el.innerText);

			const titleArticleLink = await page.$eval(".slotTitle > a", (el) => el.getAttribute("href"));
			const checkedArticleLink = checkIfFullLink(titleArticleLink, site.url);

			return {
				titleText,
				subTitleText,
				titleArticleLink: checkedArticleLink,
			};
		}

		default:
			return null;
	}
};

const checkIfFullLink = (linkToCheck, siteUrl) => {
	if (!linkToCheck.includes(siteUrl)) {
		return `${siteUrl}${linkToCheck}`;
	}
	return linkToCheck;
};

module.exports = scrapeTextsFromSite;
