const Headline = require("../models/Headline");
const { connectToMongo, disconnectFromMongo } = require("../mongo-connection");

require("dotenv").config();

const getLastHeadlineOfSiteWithConnection = async (site) => {
	await connectToMongo();

	const foundHeadline = await Headline.findOne({
		site,
	}).sort([["date", -1]]);

	console.log(foundHeadline);

	await disconnectFromMongo();
};

getLastHeadlineOfSiteWithConnection("n12");

module.exports = { getLastHeadlineOfSiteWithConnection };
