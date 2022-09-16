import chromium from "chrome-aws-lambda";
import { addExtra } from "puppeteer-extra";
//@ts-ignore
const puppeteerExtra = addExtra(chromium.puppeteer);
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import { logPurple } from "../../utils/console";
puppeteerExtra.use(AdblockerPlugin());

export const launchBrowser = async () => {
  // LiberationSans for walla
  await chromium.font(
    "https://rawcdn.githack.com/shantigilbert/liberation-fonts-ttf/ef7161f03e305982b0b247e9a0b7cc472376dd83/LiberationSans-Regular.ttf"
  );
  await chromium.font(
    "https://rawcdn.githack.com/shantigilbert/liberation-fonts-ttf/ef7161f03e305982b0b247e9a0b7cc472376dd83/LiberationSans-Bold.ttf"
  );
  await chromium.font(
    "https://rawcdn.githack.com/shantigilbert/liberation-fonts-ttf/ef7161f03e305982b0b247e9a0b7cc472376dd83/LiberationSans-Italic.ttf"
  );
  // Almoni for News13 (lesser odds of working)
  await chromium.font(
    "https://13news.co.il/wp-content/themes/reshet_tv/build/assets/fonts/Almoni/almoni-dl-aaa-300.woff"
  );
  await chromium.font(
    "https://13news.co.il/wp-content/themes/reshet_tv/build/assets/fonts/Almoni/almoni-dl-aaa-400.woff"
  );
  await chromium.font(
    "https://13news.co.il/wp-content/themes/reshet_tv/build/assets/fonts/Almoni/almoni-dl-aaa-700.woff"
  );

  const executablePath = await chromium.executablePath;
  logPurple(`executable path: ${executablePath}`);

  const browser = await puppeteerExtra.launch({
    args: chromium.args,
    defaultViewport: { width: 1536, height: 754 },
    executablePath,
    headless: true,
  });

  return browser;
};

export const closeBrowser = async (browser) => {
  browser.close();
};
