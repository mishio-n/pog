import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getInStable } from "./getInStable";

type Body = {
  horseId: string;
};

export async function PATCH(request: NextRequest, { params }: { params: { horseId: string } }) {
  const { horseId } = params;

  const horse = await prisma.horse.findUniqueOrThrow({ where: { id: +horseId } });
  const inStable = await getInStable(horse.url);

  if (horse.inStable === inStable) {
    return NextResponse.json({ status: 204 });
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

  return NextResponse.json(horse, { status: 200 });
}
