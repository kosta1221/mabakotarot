export const n12 = {
  url: "https://www.n12.co.il",
  folder: "n12",
  titleSelector: ".main1 > li > p > strong > a",
  subtitleSelector: ".main1 > li > p > span > a",
  titleArticleLinkSelector: ".main1 > li > p > strong > a",
};

export const ynet = {
  url: "https://www.ynet.co.il",
  folder: "ynet",
  titleSelector: ".slotTitle > a > span",
  subtitleSelector: ".slotSubTitle > a > span",
  titleArticleLinkSelector: ".slotTitle > a",
};

export const haaretz = {
  url: "https://www.haaretz.co.il",
  folder: "haaretz",
  titleSelector: "article > div a > h1",
  subtitleSelector: "article > div > p",
  titleArticleLinkSelector: "article > div a",
  popUpSelector: '[data-test*="bottomStrip"] button svg',
};

export const walla = {
  url: "https://www.walla.co.il",
  folder: "walla",
  titleSelector: ".main-item > article > a > h2",
  subtitleSelector: ".main-item > article > a > p",
  titleArticleLinkSelector: ".main-item > article > a",
};

export const israelhayom = {
  url: "https://www.israelhayom.co.il/",
  folder: "israelhayom",
  titleSelector: ".post-content > h2",
  subtitleSelector: ".post-content > strong",
  titleArticleLinkSelector: ".post-content > h2 > a",
};

export const news13 = {
  url: "https://13news.co.il/",
  folder: "news13",
  titleSelector: ".about-title a",
  subtitleSelector: ".about-description a",
  titleArticleLinkSelector: ".about-title a",
};

// console.log(document.querySelector(".main1 > li > p > strong > a"));
// ("main1 > li > p a");

// 	titleSelector: ".has-caption > strong > a",
// 	subtitleSelector: ".has-caption > span > a",
// 	titleArticleLinkSelector: ".has-caption > strong > a",
