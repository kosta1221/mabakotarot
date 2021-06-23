const scrapeTextsFromSite = async (site, page) => {
	const titleTextPromise = page.$eval(site.titleSelector, (el) => el.innerText);

	const subtitleTextPromise = page.$eval(site.subtitleSelector, (el) => el.innerText);

	const linkPromise = page.$eval(site.titleArticleLinkSelector, (el) => el.getAttribute("href"));

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

module.exports = scrapeTextsFromSite;
