import { retryWithTimeOut } from "./retry";

export const scrapeTextsFromSite = async (site, page, shouldRetry = false, numOfRetries = 1) => {
  const titleTextPromise = shouldRetry
    ? retryWithTimeOut(
        Number(process.env.RETRY_TIMEOUT_FOR_GET_TEXTS_IN_SECONDS) * 1000,
        numOfRetries,
        getTitleTextPromise,
        site,
        page
      )
    : getTitleTextPromise(site, page);

  const subtitleTextPromise = shouldRetry
    ? retryWithTimeOut(
        Number(process.env.RETRY_TIMEOUT_FOR_GET_TEXTS_IN_SECONDS) * 1000,
        numOfRetries,
        getSubtitleTextPromise,
        site,
        page
      )
    : getSubtitleTextPromise(site, page);

  const linkPromise = shouldRetry
    ? retryWithTimeOut(
        Number(process.env.RETRY_TIMEOUT_FOR_GET_TEXTS_IN_SECONDS) * 1000,
        numOfRetries,
        getLinkPromise,
        site,
        page
      )
    : getLinkPromise(site, page);

  const [titleText, subtitleText, link] = await Promise.all([
    titleTextPromise,
    subtitleTextPromise,
    linkPromise,
  ]);

  const titleArticleLink = checkIfFullLink(link, site.url);

  return {
    titleText,
    subtitleText,
    titleArticleLink,
  };
};

const checkIfFullLink = (linkToCheck, siteUrl) => {
  if (siteUrl.includes("walla")) {
    return linkToCheck;
  }

  if (!linkToCheck.includes(siteUrl)) {
    return `${siteUrl}${linkToCheck}`;
  }
  return linkToCheck;
};

const getTitleTextPromise = (site, page) => {
  return page.$eval(site.titleSelector, (el) => el.innerText);
};

const getSubtitleTextPromise = (site, page) => {
  return page.$eval(site.subtitleSelector, (el) => el.innerText);
};

const getLinkPromise = (site, page) => {
  return page.$eval(site.titleArticleLinkSelector, (el) => el.getAttribute("href"));
};
