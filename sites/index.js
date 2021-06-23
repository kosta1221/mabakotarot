const n12 = {
	url: "https://www.n12.co.il",
	folder: "n12",
	titleSelector: ".has-caption > strong > a",
	subtitleSelector: ".has-caption > span > a",
	titleArticleLinkSelector: ".has-caption > strong > a",
};

const ynet = {
	url: "https://www.ynet.co.il",
	folder: "ynet",
	titleSelector: ".slotTitle > a > span",
	subtitleSelector: ".slotSubTitle > a > span",
	titleArticleLinkSelector: ".slotTitle > a",
};

module.exports = { n12, ynet };
