import prisma from "@/lib/prisma";
import { getCurrentRaceScheduleWeek } from "@/lib/raceScheduleWeek";
import { Bomb } from "lucide-react";
import { Fragment } from "react";

export const revalidate = 1800;

const formatDisplayDate = (date: string) => {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  return `${year}/${month}/${day}`;
};

const getOddsAlertLevel = (odds: number | null) => {
  if (odds === null) {
    return null;
  }

  if (odds >= 100) {
    return "large";
  }

  if (odds >= 50) {
    return "medium";
  }

  if (odds >= 20) {
    return "small";
  }

  return null;
};

const getRaceOddsAlertLevel = (schedules: { odds: number | null }[]) => {
  const levels = schedules.map((schedule) => getOddsAlertLevel(schedule.odds));

  if (levels.includes("large")) {
    return "large";
  }

  if (levels.includes("medium")) {
    return "medium";
  }

  if (levels.includes("small")) {
    return "small";
  }

  return null;
};

const getCardClassName = ({
  oddsAlertLevel,
  hasDartRuleWarning,
}: {
  oddsAlertLevel: "small" | "medium" | "large" | null;
  hasDartRuleWarning: boolean;
}) => {
  if (oddsAlertLevel === "large") {
    return "border-red-400 bg-red-100";
  }

  if (oddsAlertLevel === "medium") {
    return "border-orange-400 bg-orange-100";
  }

  if (oddsAlertLevel === "small") {
    return "border-warning bg-warning/10";
  }

  if (hasDartRuleWarning) {
    return "border-warning bg-warning/10";
  }

  return "border-base-300 bg-base-100";
};

const formatOdds = (odds: number) => {
  return odds.toFixed(1);
};

const getOddsBombCount = (oddsAlertLevel: "small" | "medium" | "large" | null) => {
  if (oddsAlertLevel === "large") {
    return 3;
  }

  if (oddsAlertLevel === "medium") {
    return 2;
  }

  if (oddsAlertLevel === "small") {
    return 1;
  }

  return 0;
};

const RaceSchedulesPage = async () => {
  const { weekStart } = getCurrentRaceScheduleWeek();
  const schedules = await prisma.raceSchedule.findMany({
    where: {
      weekStart,
      horse: {
        owners: {
          some: {
            season: {
              isActive: true,
            },
          },
        },
      },
    },
    include: {
      horse: {
        include: {
          owners: {
            where: {
              season: {
                isActive: true,
              },
            },
            include: {
              rule: true,
              season: true,
            },
            orderBy: {
              id: "asc",
            },
          },
        },
      },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }, { raceNumber: "asc" }],
  });

  const scheduleGroups = Array.from(
    schedules
      .reduce((groups, schedule) => {
        const group = groups.get(schedule.raceId);

        if (group) {
          group.schedules.push(schedule);
        } else {
          groups.set(schedule.raceId, {
            race: schedule,
            schedules: [schedule],
          });
        }

        return groups;
      }, new Map<string, { race: (typeof schedules)[number]; schedules: typeof schedules }>())
      .values()
  ).sort((a, b) => {
    const dateDiff = a.race.date.localeCompare(b.race.date);
    if (dateDiff !== 0) {
      return dateDiff;
    }

    const timeDiff = (a.race.startTime ?? "99:99").localeCompare(b.race.startTime ?? "99:99");
    if (timeDiff !== 0) {
      return timeDiff;
    }

    return a.race.raceNumber - b.race.raceNumber;
  });

  return (
    <div className="artboard flex flex-col gap-4">
      <div className="border-accent mx-2 mt-4 border-b-2 border-dotted pb-1">
        <h1 className="text-xl font-semibold">今週の出走予定</h1>
      </div>

      {schedules.length === 0 ? (
        <div className="border-base-300 bg-base-100 mx-2 rounded border p-4">
          今週の出走予定はありません。
        </div>
      ) : (
        <div className="mx-2 mb-10 flex flex-col gap-3">
          {scheduleGroups.map(({ race, schedules }, index) => {
            const isTurfRace = race.courseText?.includes("芝") ?? false;
            const hasDartRuleWarning = schedules.some((schedule) =>
              schedule.horse.owners.some((owner) => owner.rule.isDart && isTurfRace)
            );
            const oddsAlertLevel = getRaceOddsAlertLevel(schedules);
            const shouldShowDateHeading = scheduleGroups[index - 1]?.race.date !== race.date;

            return (
              <Fragment key={race.raceId}>
                {shouldShowDateHeading && (
                  <div className="text-base-content/60 mt-2 border-b border-base-300 pb-1 text-sm font-semibold">
                    {formatDisplayDate(race.date)}
                  </div>
                )}
                <a
                  href={race.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`block rounded border p-3 shadow-sm ${getCardClassName({
                    oddsAlertLevel,
                    hasDartRuleWarning,
                  })}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base-content/70 text-sm">
                        {race.startTime && <span className="mr-2">{race.startTime}</span>}
                        {race.venue} {race.raceNumber}R
                      </div>
                      <div className="mt-1 font-semibold">{race.raceName}</div>
                      <div className="mt-1 text-sm">
                        {[race.courseText, race.distanceText].filter(Boolean).join("")}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {hasDartRuleWarning && (
                        <div className="badge badge-warning whitespace-nowrap">ダート注意</div>
                      )}
                    </div>
                  </div>

                  <div className="border-base-300 mt-3 flex flex-col gap-2 border-t pt-3">
                    {schedules.map((schedule) => {
                      const ownerLabels = schedule.horse.owners.map(
                        (owner) => `${owner.name}（${owner.season.name}・${owner.rule.name}）`
                      );
                      const oddsAlertLevel = getOddsAlertLevel(schedule.odds);

                      return (
                        <div key={schedule.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`font-black ${
                                schedule.horse.genderCategory === "MALE"
                                  ? "text-primary"
                                  : "text-secondary"
                              }`}
                            >
                              {schedule.horse.name}
                            </div>
                            {getOddsBombCount(oddsAlertLevel) > 0 && (
                              <span className="inline-flex shrink-0 items-center gap-0.5 text-slate-500">
                                {Array.from({ length: getOddsBombCount(oddsAlertLevel) }).map(
                                  (_, index) => (
                                    <span key={index} className="relative inline-flex">
                                      <Bomb
                                        size={14}
                                        fill="currentColor"
                                        strokeWidth={1.8}
                                        aria-hidden="true"
                                      />
                                      <span
                                        className="absolute -right-1.5 -top-1 h-2 w-2 bg-orange-400 shadow-[0_0_5px_rgba(251,146,60,0.95)] ring-1 ring-amber-200 [clip-path:polygon(50%_0%,61%_32%,95%_20%,70%_50%,95%_80%,61%_68%,50%_100%,39%_68%,5%_80%,30%_50%,5%_20%,39%_32%)]"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  )
                                )}
                              </span>
                            )}
                          </div>
                          {ownerLabels.length > 0 && (
                            <div className="text-base-content/70 mt-1 text-sm">
                              {ownerLabels.join(" / ")}
                            </div>
                          )}
                          {schedule.odds !== null && (
                            <div
                              className={`mt-1 text-sm ${
                                oddsAlertLevel ? "font-semibold text-error" : "text-base-content/70"
                              }`}
                            >
                              {formatOdds(schedule.odds)}倍
                              {schedule.popularity !== null && (
                                <span className="ml-2">{schedule.popularity}人気</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </a>
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RaceSchedulesPage;
