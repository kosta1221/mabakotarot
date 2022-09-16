import { DateTime } from "luxon";

export const getRoundedDownDateByMinutesInterval = (interval = 15) => {
  const start = DateTime.fromObject({}, { zone: "UTC+3" });

  const remainder = start.minute % interval;

  const roundedDateTime = start.minus({ minutes: remainder });
  return roundedDateTime;
};
