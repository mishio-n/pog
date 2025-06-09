import type { aggregateRacePoint } from "@/logic/race-point";
import type { Horse, Race } from "@prisma/client";
import { RaceItem } from "./raceItem";

type Props = {
  horseWithRacePoint: Horse & {
    races: Race[];
  } & ReturnType<typeof aggregateRacePoint>;
  isDart: boolean;
};

export const Races: React.FC<Props> = ({ horseWithRacePoint, isDart }) => {
  return (
    <>
      <div className="mx-2 mt-4 flex items-center border-b-2 border-dotted border-accent">
        <span className="text-xl text-transparent text-shadow">&#127942;</span>
        <span className="ml-2 text-lg font-semibold">レース</span>
      </div>
      <div className="mx-1 mt-2 flex w-full flex-col py-1 pl-1 pr-4">
        {horseWithRacePoint.races.map((race, index) => (
          <div key={race.id}>
            {index !== 0 && <div className="divider mb-1 mt-1" />}
            <RaceItem race={race} isDart={isDart} />
          </div>
        ))}
      </div>
    </>
  );
};
