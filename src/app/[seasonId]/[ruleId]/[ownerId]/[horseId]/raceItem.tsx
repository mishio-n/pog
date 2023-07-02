"use client";

import { styled } from "@kuma-ui/core";
import { Race } from "@prisma/client";
import Link from "next/link";
import { match } from "ts-pattern";

type Props = {
  race: Race;
};

const ResultShineBadge = styled("div")`
  ::before {
    content: "";
    position: absolute;
    top: 0;
    left: -75%;
    width: 50%;
    height: 100%;
    background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 100%);
    transform: skewX(-25deg);
  }

  :before {
    animation: shine 4s infinite;
  }

  @keyframes shine {
    0% {
      left: -75%;
    }
    75% {
      left: -75%;
    }
    100% {
      left: 75%;
    }
  }
`;

export const RaceItem: React.FC<Props> = ({ race }) => {
  const resultBgColor = match(race.result)
    .with(1, () => `bg-[#f7ef8e]`)
    .with(2, () => `bg-[#e1e7ef]`)
    .with(3, () => `bg-[#eaac6e]`)
    .otherwise(() => "");

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {race.result > 3 ? (
            <div className={`relative flex h-12 w-12 items-end justify-center rounded-full p-2`}>
              <span className="font-mono text-2xl">{race.result}</span>
              <span className="text-sm">着</span>
            </div>
          ) : (
            <ResultShineBadge
              className={`relative flex h-12 w-12 items-end justify-center rounded-full p-2 ${resultBgColor}`}
            >
              <span className="font-mono text-2xl">{race.result}</span>
              <span className="text-sm">着</span>
            </ResultShineBadge>
          )}
          <Link
            rel="noreferrer"
            target="_blank"
            href={race.url}
            className="ml-4 flex flex-col gap-[2px]"
          >
            <span className="w-32 overflow-hidden text-ellipsis whitespace-nowrap text-xl">
              {race.name}
            </span>
            <div
              className={`h-[2px] rounded-lg ${
                race.course === "TURF" ? "bg-green-300" : "bg-orange-400"
              }`}
            />
          </Link>
        </div>
        <div className="flex flex-col items-end">
          <div>
            <span className="ml-2 font-mono text-xl">{Math.round(race.odds * race.point)}</span>
            <span className="ml-2 text-sm">pt</span>
          </div>
          <div>
            <span className="font-mono text-sm">{race.odds}</span>
            <span className="px-2 text-xs">×</span>
            <span className="font-mono text-sm">{race.point}</span>
          </div>
        </div>
      </div>
    </>
  );
};
