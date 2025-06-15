import type { Race } from "@prisma/client";

export type RacePoint = {
  totalPoint: number;
  totalBasePoint: number;
  averageOdds: number;
};

export const aggregateRacePoint = (
  races: Race[],
  isDart = false,
  duplicateCount = 0
): RacePoint => {
  const averageOdds =
    races.length === 0
      ? 0
      : Math.round((races.reduce((result, race) => result + race.odds, 0) / races.length) * 10) /
        10;
  const duplicateRate = (count: number) => (count === 0 ? 1 : +(1 / count).toFixed(2));
  const aggregated = races.reduce(
    (result, race) => {
      const coefficient = isDart && race.course === "TURF" ? -1 : 1;
      return {
        totalBasePoint: result.totalBasePoint + race.point,
        totalPoint: result.totalPoint + Math.round(race.point * race.odds) * coefficient,
        averageOdds,
      };
    },
    { totalBasePoint: 0, totalPoint: 0, averageOdds } as RacePoint
  );

  return {
    ...aggregated,
    totalPoint: Math.round(aggregated.totalPoint * duplicateRate(duplicateCount)),
  };
};
