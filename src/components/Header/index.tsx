"use client";

import { useRaceScheduleSummary } from "@/components/RaceScheduleSummaryProvider";
import Image from "next/image";
import Link from "next/link";

export const Header: React.FC = () => {
  const { summary } = useRaceScheduleSummary();

  return (
    <header className="navbar sticky left-0 top-0 z-50 flex justify-between bg-[rgb(0,0,30)] text-neutral-content shadow-md shadow-gray-700">
      <Link
        href={"/"}
        className="inline-flex cursor-pointer items-center justify-center text-center text-xl font-bold normal-case text-white"
      >
        <Image
          src="/android-chrome-512x512.png"
          alt="icon"
          width={64}
          height={64}
          className="no-animation absolute left-2 top-0 h-16 w-16"
          priority
        />
        <span className="ml-17">おうちPOG</span>
      </Link>
      <Link href="/this-week" className="btn btn-accent btn-sm mr-1">
        <span>今週の出走</span>
        {summary && summary.count > 0 && (
          <span className="badge badge-neutral badge-sm">{summary.count}</span>
        )}
      </Link>
      {/* {segments.length === 0 && <RaceResultRegisterButton />} */}
    </header>
  );
};
