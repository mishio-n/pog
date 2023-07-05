import { prisma } from "@/lib/prisma";
import { Course, Grade } from "@prisma/client";
import chromium from "chrome-aws-lambda";
import playwright from "playwright-core";
import puppeteer, { Browser } from "puppeteer-core";
import { match } from "ts-pattern";

export const scrapeRaceData = async (raceId: string) => {
  const browser =
    process.env.NODE_ENV === "production"
      ? ((await playwright.chromium.launch({
          args: chromium?.args,
          executablePath: await chromium?.executablePath,
          headless: true,
        })) as unknown as Browser)
      : await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`https://race.netkeiba.com/race/result.html?race_id=${raceId}`);

  const raceTitle = await page.$("div.RaceName");
  if (raceTitle === null) {
    throw new Error("raceTitle is not found");
  }

  const title = await page.$eval("div.RaceName", (el) => el.textContent);
  if (title === null) {
    throw new Error("title is not found");
  }

  const raceData = await page.$eval("div.RaceData01 > span", (el) => el.textContent);
  if (raceData === null) {
    throw new Error("raceData is not found");
  }

  const course = raceData.includes("芝") ? Course.TURF : Course.DART;

  let gradeInfo = "";
  try {
    gradeInfo = await raceTitle.$eval("span.Icon_GradeType", (el) => el.className);
  } catch (error) {
    // グレードなしはスキップ
  }
  const gradeMathced = gradeInfo.match(/Icon_GradeType(\d)$/)?.[1];
  const grade = match(gradeMathced)
    .with("1", () => Grade.G1)
    .with("2", () => Grade.G2)
    .with("3", () => Grade.G3)
    .otherwise(() => Grade.NORMAL);

  const dd = await page.$eval("#RaceList_DateList > dd.Active > a", (el) => el.href);

  const dateLink = new URL(dd);
  const date = dateLink.searchParams.get("kaisai_date");
  if (date === null) {
    throw new Error("date is not found");
  }

  const horses = await page.$$eval(
    "table.RaceTable01 > tbody > tr > td.Horse_Info > span > a",
    (el) => el.map((e) => e.textContent!)
  );
  const oddsList = await page.$$eval(
    "table.RaceTable01 > tbody > tr > td.Odds.Txt_R > span",
    (el) => el.map((e) => +e.textContent!)
  );

  const prizesText = await page.$$eval("div.RaceData02 > span", (el) => el.at(-1)?.textContent);
  if (!prizesText) {
    throw new Error();
  }

  const p = prizesText.match(/([0-9,]+)/g);
  if (!p) {
    throw new Error("prizes is not found");
  }
  const prizes = p[0].split(",");

  const registerdHorses = await prisma.horse.findMany({ include: { owners: true } });
  const targetHorses = registerdHorses.filter(({ name }) => horses.includes(name));

  const results = targetHorses.map((horse) => {
    const result = horses.indexOf(horse.name) + 1;
    const point = result > 5 ? 0 : +prizes[result - 1];

    return {
      name: title.trim(),
      url: `https://db.netkeiba.com/race/${raceId}/`,
      date,
      course,
      grade,
      result,
      horse,
      point,
      odds: oddsList[result - 1],
    };
  });

  await browser.close();

  return results;
};
