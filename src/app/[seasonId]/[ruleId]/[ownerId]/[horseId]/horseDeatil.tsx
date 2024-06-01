"use client";

import { Horse } from "@prisma/client";
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
      <div className={`flex items-center`}>
        <div className={`h-[18px] w-[18px] rounded-full ${stableColor}`} />
        <span className="ml-1">{horse.stable}</span>
      </div>
      <div className="absolute top-64 flex justify-center">
        <Toaster />
      </div>
    </div>
  );
};
