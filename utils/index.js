const { DateTime } = require("luxon");
require("dotenv").config();

const getFileNameFromOptions = (options) => {
	const { year, month, day, hour, minute } = options;

	const dateTime = new DateTime(DateTime.local()).set({
		hour,
		minute,
		day,
		month,
		year,
	});
	const fileName = dateTime.toFormat("yyyy-MM-dd_HH-mm");

	return fileName;
};

const getDateFromOptions = (options) => {
	const { year, month, day, hour, minute } = options;

	const dateTime = new DateTime(DateTime.local()).set({
		hour,
		minute,
		day,
		month,
		year,
	});
	const date = dateTime.toFormat("yyyy-MM-dd HH:mm");

	return date;
};

const getS3UrlFromSiteAndFileName = (site, fileName, format = "webp") => {
	const s3Url = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${site}/${fileName}.${format}`;

	return s3Url;
};

module.exports = { getFileNameFromOptions, getDateFromOptions, getS3UrlFromSiteAndFileName };
