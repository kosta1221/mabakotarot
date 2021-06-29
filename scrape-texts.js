const retry = require("./utils/retry");

const scrapeTextsFromSite = async (site, page) => {
	const titleTextPromise = retry(3, getTitleTextPromise, site, page);

	const subtitleTextPromise = retry(3, getSubtitleTextPromise, site, page);

	const linkPromise = retry(3, getLinkPromise, site, page);

	const [titleText, subtitleText, link] = await Promise.all([
		titleTextPromise,
		subtitleTextPromise,
		linkPromise,
	]);

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

const getTitleTextPromise = (site, page) => {
	return page.$eval(site.titleSelector, (el) => el.innerText);
};

const getSubtitleTextPromise = (site, page) => {
	return page.$eval(site.subtitleSelector, (el) => el.innerText);
};

const getLinkPromise = (site, page) => {
	return page.$eval(site.titleArticleLinkSelector, (el) => el.getAttribute("href"));
};

module.exports = scrapeTextsFromSite;
