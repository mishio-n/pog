"use client";

import { aggregateRacePoint } from "@/logic/race-point";
import type { Horse, Owner, Race } from "@prisma/client";

type Props = {
  owner: Owner;
  horseWithRacePoint: Horse & {
    races: Race[];
  } & ReturnType<typeof aggregateRacePoint>;
  raceResults: {
    first: number;
    second: number;
    third: number;
    other: number;
  };
  basePath: string;
};
