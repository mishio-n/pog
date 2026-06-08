import prisma from "@/lib/prisma";
import { getCurrentRaceScheduleWeek } from "@/lib/raceScheduleWeek";

export const dynamic = "force-dynamic";

const formatDisplayDate = (date: string) => {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  return `${year}/${month}/${day}`;
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
    orderBy: [{ date: "asc" }, { venue: "asc" }, { raceNumber: "asc" }],
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
  );

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
        <div className="mx-2 flex flex-col gap-3">
          {scheduleGroups.map(({ race, schedules }) => {
            const isTurfRace = race.courseText?.includes("芝") ?? false;
            const hasDartRuleWarning = schedules.some((schedule) =>
              schedule.horse.owners.some((owner) => owner.rule.isDart && isTurfRace)
            );

            return (
              <a
                key={race.raceId}
                href={race.url}
                target="_blank"
                rel="noreferrer"
                className={`bg-base-100 block rounded border p-3 shadow-sm ${
                  hasDartRuleWarning ? "border-warning bg-warning/10" : "border-base-300"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base-content/70 text-sm">
                      {formatDisplayDate(race.date)} {race.venue} {race.raceNumber}R
                      {race.startTime && <span className="ml-2">{race.startTime}</span>}
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

                    return (
                      <div key={schedule.id}>
                        <div
                          className={`font-black ${
                            schedule.horse.genderCategory === "MALE"
                              ? "text-primary"
                              : "text-secondary"
                          }`}
                        >
                          {schedule.horse.name}
                        </div>
                        {ownerLabels.length > 0 && (
                          <div className="text-base-content/70 mt-1 text-sm">
                            {ownerLabels.join(" / ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RaceSchedulesPage;
