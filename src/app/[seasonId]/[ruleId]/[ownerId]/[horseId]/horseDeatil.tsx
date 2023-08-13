"use client";

import { Horse } from "@prisma/client";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { match } from "ts-pattern";

type Props = {
  horse: Horse;
};

export const HorseDetail: React.FC<Props> = ({ horse }) => {
  const stableColor = match(horse.region)
    .with("MIHO", () => `bg-[#ff6881]`)
    .with("RITTO", () => `bg-[#3D96D6]`)
    .otherwise(() => `bg-accent`);

  const [canClick, setCanClick] = useState(true);

  return (
    <div className="mt-4 flex items-center justify-between">
      <h1
        className={`text-2xl font-bold ${
          horse.genderCategory === "MALE" ? "text-primary" : "text-secondary"
        }`}
      >
        <a href={horse.url} target="_blank" rel="noreferrer">
          {horse.name}
        </a>
      </h1>
      <button
        className={`flex cursor-pointer items-center`}
        // className={`flex cursor-pointer items-center ${horse.inStable ? "" : "opacity-40"}`}
        disabled={!canClick}
        // onClick={() => updateStableStatus({ horseId: horse.id }).then(() => setCanClick(false))}
      >
        <div className={`h-[18px] w-[18px] rounded-full ${stableColor}`} />
        <span className="ml-1">{horse.stable}</span>
      </button>
      <div className="absolute top-64 flex justify-center">
        <Toaster />
      </div>
    </div>
  );
};
