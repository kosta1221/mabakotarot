const n12 = {
	url: "https://www.n12.co.il",
	folder: "n12",
	titleSelector: ".main1 > li > p > strong > a",
	subtitleSelector: ".main1 > li > p > span > a",
	titleArticleLinkSelector: ".main1 > li > p > strong > a",
};

const ynet = {
	url: "https://www.ynet.co.il",
	folder: "ynet",
	titleSelector: ".slotTitle > a > span",
	subtitleSelector: ".slotSubTitle > a > span",
	titleArticleLinkSelector: ".slotTitle > a",
};

const haaretz = {
	url: "https://www.haaretz.co.il",
	folder: "haaretz",
	titleSelector: "article > div a > h1",
	subtitleSelector: "article > div > p",
	titleArticleLinkSelector: "article > div a",
	popUpSelector: '[data-test*="bottomStrip"] button svg',
};

module.exports = { n12, ynet, haaretz };

// console.log(document.querySelector(".main1 > li > p > strong > a"));
// ("main1 > li > p a");

// 	titleSelector: ".has-caption > strong > a",
// 	subtitleSelector: ".has-caption > span > a",
// 	titleArticleLinkSelector: ".has-caption > strong > a",
