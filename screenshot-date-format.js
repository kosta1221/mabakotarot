const { DateTime } = require("luxon");

const getRoundedDownDateByMinutesInterval = (interval = 15) => {
	const start = DateTime.fromObject({ zone: "UTC+3" });

	const remainder = start.minute % interval;

	const dateTime = new DateTime(start).minus({ minutes: remainder });
	return dateTime;
};

module.exports = getRoundedDownDateByMinutesInterval;
