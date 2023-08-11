"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import puppeteer from "puppeteer";

const getInStable = async (url: string): Promise<boolean> => {
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

export async function updateStableStatus({ horseId }: { horseId: number }) {
  const horse = await prisma.horse.findUniqueOrThrow({ where: { id: +horseId } });
  const inStable = await getInStable(horse.url);

  if (horse.inStable === inStable) {
    return horse;
  }

  await prisma.horse.update({
    where: { id: horse.id },
    data: { inStable },
  });

  const owners = await prisma.owner.findMany({
    where: { horses: { some: { id: horse.id } } },
  });

  for (const owner of owners) {
    revalidatePath(`${owner.seasonId}/${owner.ruleId}/${owner.id}/${horse.id}`);
  }

  return horse;
}
