"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { scrapeRaceData } from "./scrapeRaceData";

export async function addRaceResult({ raceId }: { raceId: string }) {
  const results = await scrapeRaceData(raceId);
  for (const result of results) {
    await prisma.race.create({
      data: {
        name: result.name,
        odds: result.odds,
        point: result.point,
        result: result.result,
        horseId: result.horse.id,
        date: result.date,
        url: result.url,
        course: result.course,
        grade: result.grade,
      },
    });
    const owners = await prisma.owner.findMany({
      where: { horses: { some: { id: result.horse.id } } },
    });

    revalidatePath(`/`);
    for (const owner of owners) {
      revalidatePath(`/${owner.seasonId}`);
      revalidatePath(`/${owner.seasonId}/${owner.ruleId}`);
      revalidatePath(`/${owner.seasonId}/${owner.ruleId}/${owner.id}`);
      revalidatePath(`/${owner.seasonId}/${owner.ruleId}/${owner.id}/${result.horse.id}`);
    }
  }

  return results;
}
