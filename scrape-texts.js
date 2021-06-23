const scrapeTextsFromSite = async (site, page) => {
	const titleText = await page.$eval(site.titleSelector, (el) => el.innerText);

	const subtitleText = await page.$eval(site.subtitleSelector, (el) => el.innerText);

	const link = await page.$eval(site.titleArticleLinkSelector, (el) => el.getAttribute("href"));
	const titleArticleLink = checkIfFullLink(link, site.url);

	return {
		titleText,
		subtitleText,
		titleArticleLink,
	};
};

const checkIfFullLink = (linkToCheck, siteUrl) => {
	if (!linkToCheck.includes(siteUrl)) {
		return `${siteUrl}${linkToCheck}`;
	}
	return linkToCheck;
};

module.exports = scrapeTextsFromSite;
