const Headline = require("../models/Headline");

require("dotenv").config();

const getLastHeadlineOfSite = async (site) => {
	const foundHeadline = await Headline.findOne({
		site,
	}).sort([["date", -1]]);

	console.log(foundHeadline);
};

module.exports = { getLastHeadlineOfSite };
