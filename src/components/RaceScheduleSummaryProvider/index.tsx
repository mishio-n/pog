"use client";

import { createContext, useContext, useEffect, useState } from "react";

type RaceScheduleSummary = {
  count: number;
  weekStart: string;
};

type RaceScheduleSummaryContextValue = {
  summary: RaceScheduleSummary | null;
};

const RaceScheduleSummaryContext = createContext<RaceScheduleSummaryContextValue>({
  summary: null,
});

export const RaceScheduleSummaryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [summary, setSummary] = useState<RaceScheduleSummary | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch("/api/race-schedules/summary")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: RaceScheduleSummary | null) => {
        if (!ignore) {
          setSummary(data);
        }
      })
      .catch(() => {
        if (!ignore) {
          setSummary(null);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <RaceScheduleSummaryContext.Provider value={{ summary }}>
      {children}
    </RaceScheduleSummaryContext.Provider>
  );
};

export const useRaceScheduleSummary = () => useContext(RaceScheduleSummaryContext);
