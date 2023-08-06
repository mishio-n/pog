import puppeteer from "puppeteer";

export const getInStable = async (url: string): Promise<boolean> => {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
  });
  const page = await browser.newPage();

  await page.goto(url);

  try {
    const stableState = await page.$eval(
      "body > div.Wrap.fc > div.Contents > div > section.ProfileHeader > div > div.Data > span:nth-child(5)",
      (el) => el.textContent
    );

    await page.close();
    return stableState === "入厩中";
  } catch (error) {
    await page.close();
    return false;
  }
};
