"use client";

import type { aggregateRacePoint } from "@/logic/race-point";
import type { Horse, Race } from "@prisma/client";
import Link from "next/link";
import { useOddsSwitch } from "./oddsSwitchProvider";

type Props = {
  horsesWithRacePoint: (Horse & { races: Race[] } & ReturnType<typeof aggregateRacePoint>)[];
  basePath: string;
};

export const Horses: React.FC<Props> = ({ horsesWithRacePoint, basePath }) => {
  const { isShowTotalPoint } = useOddsSwitch();
  const zekkenType = (races: Race[]) => {
    const grades = races.filter((r) => r.result === 1).map((r) => r.grade);

    return grades.includes("G1")
      ? "classic"
      : grades.includes("G2")
      ? "g2"
      : grades.includes("G3")
      ? "g3"
      : "tokubetsu";
  };

  return (
    <>
      <div className="mx-2 mt-4 flex items-center border-b-2 border-dotted border-accent">
        <span className="text-xl text-transparent text-shadow">&#128014;</span>
        <span className="ml-2 text-lg font-semibold">指名馬</span>
      </div>
      <div className="artboard px-2 py-2">
        {horsesWithRacePoint.map((horse, i) => (
          <Link href={`${basePath}/${horse.id}`} key={horse.id}>
            <div className="flex items-center justify-between p-1">
              <div className="ml-[-12px] flex items-center justify-start">
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://zekken-maker.vercel.app?name=${
                      horse.name.includes("の") ? "バメイミテイ" : horse.name
                    }&number=${i + 1}&type=${zekkenType(horse.races)}`}
                    alt={horse.name}
                    className="w-8"
                  />
                }
                <span
                  className={`font-black ${
                    horse.genderCategory === "MALE" ? "text-primary" : "text-secondary"
                  } pl-3`}
                  // className={`${horse.inStable ? "font-black" : "font-thin"} ${
                  //   horse.genderCategory === "MALE" ? "text-primary" : "text-secondary"
                  // } pl-3`}
                >
                  {horse.name}
                </span>
              </div>
              <div>
                <span className="font-mono">
                  {isShowTotalPoint ? horse.totalPoint : horse.totalBasePoint}
                </span>
                <span className="ml-2">pt</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};
