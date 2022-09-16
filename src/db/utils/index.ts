import Headline from "../models/Headline";

export const getLastHeadlineOfSite = async (site) => {
  const foundHeadline = await Headline.findOne({
    site,
  }).sort([["date", -1]]);

  console.log(`last found headline of ${site}: ${foundHeadline?.date}`);

  return foundHeadline;
};
