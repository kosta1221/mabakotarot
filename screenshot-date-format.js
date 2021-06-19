const { DateTime } = require("luxon");

const getRoundedDownDateByMinutesInterval = (interval = 15) => {
	const start = DateTime.local();

	const remainder = start.minute % interval;

	const dateTime = new DateTime(start).minus({ minutes: remainder });
	return dateTime;
};

module.exports = getRoundedDownDateByMinutesInterval;
