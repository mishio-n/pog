import { getCurrentRaceScheduleWeek } from "@/lib/raceScheduleWeek";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { weekStart } = getCurrentRaceScheduleWeek();
  const count = await prisma.raceSchedule.count({
    where: {
      weekStart,
      horse: {
        owners: {
          some: {
            season: {
              isActive: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ count, weekStart });
}
