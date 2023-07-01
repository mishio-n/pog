import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { scrapeRaceData } from "./scrapeRaceData";

type Body = {
  raceId: string;
};

export async function POST(request: NextRequest) {
  const { raceId }: Body = await request.json();

  try {
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

      for (const owner of owners) {
        revalidatePath(`${owner.seasonId}/${owner.ruleId}/${owner.id}/${result.horse.id}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: error }, { status: 500 });
  }
}
