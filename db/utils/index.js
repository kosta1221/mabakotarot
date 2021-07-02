const Headline = require("../models/Headline");

require("dotenv").config();

const getLastHeadlineOfSite = async (site) => {
	const foundHeadline = await Headline.findOne({
		site,
	}).sort([["date", -1]]);

	console.log(`last found headline of ${site}: ${foundHeadline.date}`);

	return foundHeadline;
};

module.exports = { getLastHeadlineOfSite };
