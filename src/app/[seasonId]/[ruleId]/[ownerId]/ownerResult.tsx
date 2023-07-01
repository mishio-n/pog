"use client";

import { aggregateRacePoint } from "@/logic/race-point";
import type { Horse, Race } from "@prisma/client";
import { useCallback } from "react";
import { useOddsSwitch } from "./oddsSwitchProvider";

type Props = {
  horsesWithRacePoint: (Horse & { races: Race[] } & ReturnType<typeof aggregateRacePoint>)[];
};

export const OwnerResult: React.FC<Props> = ({ horsesWithRacePoint }) => {
  const { isShowTotalPoint } = useOddsSwitch();

  const sumPoint = useCallback(
    () =>
      horsesWithRacePoint.reduce(
        (result, curr) => result + (isShowTotalPoint ? curr.totalPoint : curr.totalBasePoint),
        0
      ),
    [isShowTotalPoint, horsesWithRacePoint]
  );

  const sumRaceResult = useCallback(() => {
    const races = horsesWithRacePoint.map((horse) => horse.races).flat();
    const firstResults = races.filter((race) => race.result === 1);
    return {
      first: firstResults.length,
      total: races.length,
    };
  }, [horsesWithRacePoint]);

  const ageraveOdds = useCallback(() => {
    const debuted = horsesWithRacePoint.filter((horse) => horse.races.length !== 0);
    return debuted.length === 0
      ? "-"
      : Math.round(
          (debuted.reduce((result, curr) => result + curr.averageOdds, 0) / debuted.length) * 10
        ) / 10;
  }, [horsesWithRacePoint]);

  return (
    <>
      <div className="mx-2 mt-2 flex items-center border-b-2 border-dotted border-accent">
        <span className="text-xl text-transparent text-shadow">&#128178;</span>
        <span className="ml-2 text-lg font-semibold">成績</span>
      </div>
      <div className="mx-2 flex flex-col p-1 ">
        <div className="mt-2 flex w-[280px] items-center justify-between">
          <span className="font-semibold">合計　　　：</span>
          <div className="ml-2 flex items-center">
            <span className="font-mono text-xl">{sumPoint()}</span>
            <span className="ml-2">ポイント</span>
          </div>
        </div>
        <div className="mt-2 flex w-[280px] items-center justify-between">
          <span className="font-semibold">平均オッズ：</span>
          <div className="ml-2 flex items-center">
            <span className="font-mono text-xl">{ageraveOdds()}</span>
            <span className="ml-2">倍</span>
          </div>
        </div>
        <div className="mt-2 flex w-[280px] items-center justify-between">
          <span className="font-semibold">戦績　　　：</span>
          <div className="ml-2 flex items-center">
            <span className="font-mono text-xl">{sumRaceResult().total}</span>
            <span className="ml-2">戦</span>
            <span className="ml-2 font-mono text-xl">{sumRaceResult().first}</span>
            <span className="ml-2">勝</span>
          </div>
        </div>
      </div>
    </>
  );
};
