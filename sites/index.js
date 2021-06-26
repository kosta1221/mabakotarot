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

module.exports = { n12, ynet };

// console.log(document.querySelector(".main1 > li > p > strong > a"));
// ("main1 > li > p a");

// 	titleSelector: ".has-caption > strong > a",
// 	subtitleSelector: ".has-caption > span > a",
// 	titleArticleLinkSelector: ".has-caption > strong > a",
