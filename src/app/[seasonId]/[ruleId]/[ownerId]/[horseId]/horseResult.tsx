import type { aggregateRacePoint } from "@/logic/race-point";
import type { Horse, Race } from "@prisma/client";

type Props = {
  horseWithRacePoint: Horse & {
    races: Race[];
  } & ReturnType<typeof aggregateRacePoint>;
};

type RaceResults = {
  first: number;
  second: number;
  third: number;
  other: number;
};

export const HorseResult: React.FC<Props> = ({ horseWithRacePoint }) => {
  const raceResults: RaceResults = horseWithRacePoint.races.reduce(
    (result, cuur) => {
      switch (cuur.result) {
        case 1:
          result.first++;
          break;
        case 2:
          result.second++;
          break;
        case 3:
          result.third++;
          break;
        default:
          result.other++;
          break;
      }
      return result;
    },
    { first: 0, second: 0, third: 0, other: 0 }
  );

  return (
    <>
      <div className="mx-2 mt-4 flex items-center border-b-2 border-dotted border-accent">
        <span className="text-xl text-transparent text-shadow">&#128178;</span>
        <span className="ml-2 text-lg font-semibold">成績</span>
      </div>
      <div className="mx-2 flex flex-col p-1 ">
        <div className="mt-2 flex w-full items-center justify-between">
          <span className="font-semibold">合計　　　：</span>
          <div className="ml-2 flex items-center">
            <span className="font-mono text-xl">{horseWithRacePoint.totalPoint}</span>
            <span className="ml-2">ポイント</span>
          </div>
        </div>
        <div className="mt-2 flex w-full items-center justify-between">
          <span className="font-semibold">基礎合計　：</span>
          <div className="ml-2 flex items-center">
            <span className="font-mono text-xl">{horseWithRacePoint.totalBasePoint}</span>
            <span className="ml-2">ポイント</span>
          </div>
        </div>
        <div className="mt-2 flex w-full items-center justify-between">
          <span className="font-semibold">平均オッズ：</span>
          <div className="ml-2 flex items-center">
            <span className="font-mono text-xl">
              {horseWithRacePoint.averageOdds !== 0 ? horseWithRacePoint.averageOdds : "-"}
            </span>
            <span className="ml-2">倍</span>
          </div>
        </div>
        <div className="mt-2 flex w-full items-center justify-between">
          <span className="font-semibold">戦績　　　：</span>
          <div className="ml-2 flex items-center">
            <span className="font-mono text-xl">{raceResults.first}</span>
            <span className="ml-2">-</span>
            <span className="ml-2 font-mono text-xl">{raceResults.second}</span>
            <span className="ml-2">-</span>
            <span className="ml-2 font-mono text-xl">{raceResults.third}</span>
            <span className="ml-2">-</span>
            <span className="ml-2 font-mono text-xl">{raceResults.other}</span>
          </div>
        </div>
      </div>
    </>
  );
};
