import { DateTime } from "luxon";
require("dotenv").config();

export const getFileNameFromOptions = (options) => {
  const { year, month, day, hour, minute } = options;

  const dateTime = DateTime.local().set({
    hour,
    minute,
    day,
    month,
    year,
  });
  const fileName = dateTime.toFormat("yyyy-MM-dd_HH-mm");

  return fileName;
};

export const getDateFromOptions = (options) => {
  const { year, month, day, hour, minute } = options;

  const dateTime = DateTime.local().set({
    hour,
    minute,
    day,
    month,
    year,
  });
  const date = dateTime.toFormat("yyyy-MM-dd HH:mm");

  return date;
};

export const getS3UrlFromSiteAndFileName = (site, fileName, format = "webp") => {
  const s3Url = `https://${process.env.BUCKET_NAME}.s3.amazonaws.com/${site}/${fileName}.${format}`;

  return s3Url;
};
