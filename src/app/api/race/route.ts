import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { scrapeRaceData } from "./scrapeRaceData";

type Body = {
  raceId: string;
};

export async function POST(request: NextRequest) {
  const { raceId }: Body = await request.json();

  const datas = await scrapeRaceData(raceId);
  for (const data of datas) {
    await prisma.race.create({
      data: { ...data, horse: { connect: { id: data.horse.id } } },
    });
    const owners = await prisma.owner.findMany({
      where: { horses: { some: { id: data.horse.id } } },
    });

    for (const owner of owners) {
      revalidatePath(`${owner.seasonId}/${owner.ruleId}/${owner.id}/${data.horse.id}`);
    }
  }

  return NextResponse.json(datas);
}
