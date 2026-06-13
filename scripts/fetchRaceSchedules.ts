import * as cheerio from "cheerio";
import {
  addRaceScheduleDays,
  formatRaceScheduleDate,
  getCurrentRaceScheduleWeek,
} from "../src/lib/raceScheduleWeek";

type RaceListItem = {
  raceId: string;
  date: string;
  venue: string;
  raceNumber: number;
  raceName: string;
  startTime: string | null;
  courseText: string | null;
  distanceText: string | null;
  url: string;
};

type RaceScheduleInput = RaceListItem & {
  horseId: number;
  horseNumber: number | null;
  weekStart: string;
};

type TargetHorse = {
  id: number;
  name: string;
  url: string;
};

type CliOptions = {
  dryRun: boolean;
  horseExternalIds: string[];
  dates: string[] | null;
  weekStart: string | null;
  maxRaces: number | null;
};

const NETKEIBA_RACE_BASE_URL = "https://race.netkeiba.com";
const REQUEST_INTERVAL_MS = 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseCsvOption = (value: string | undefined) => {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    : [];
};

const parseArgs = (argv: string[]): CliOptions => {
  const options: CliOptions = {
    dryRun: false,
    horseExternalIds: [],
    dates: null,
    weekStart: null,
    maxRaces: null,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    const [key, value] = arg.split("=");

    switch (key) {
      case "--horse-external-ids":
        options.horseExternalIds.push(...parseCsvOption(value));
        break;
      case "--horse-urls":
        options.horseExternalIds.push(
          ...parseCsvOption(value).flatMap((url) => {
            const externalId = extractHorseExternalId(url);
            return externalId ? [externalId] : [];
          })
        );
        break;
      case "--dates":
        options.dates = parseCsvOption(value);
        break;
      case "--week-start":
        options.weekStart = value ?? null;
        break;
      case "--max-races":
        options.maxRaces = value ? Number.parseInt(value, 10) : null;
        break;
    }
  }

  options.horseExternalIds.push(...parseCsvOption(process.env.DRY_RUN_HORSE_EXTERNAL_IDS));
  options.horseExternalIds.push(
    ...parseCsvOption(process.env.DRY_RUN_HORSE_URLS).flatMap((url) => {
      const externalId = extractHorseExternalId(url);
      return externalId ? [externalId] : [];
    })
  );

  options.horseExternalIds = [...new Set(options.horseExternalIds)];

  return options;
};

const fetchText = async (url: string, encoding: "utf-8" | "euc-jp") => {
  const response = await fetch(url, {
    headers: {
      referer: `${NETKEIBA_RACE_BASE_URL}/top/race_list.html`,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  return new TextDecoder(encoding).decode(buffer);
};

const extractRaceId = (href: string | undefined) => {
  return href?.match(/[?&]race_id=(\d+)/)?.[1] ?? null;
};

const extractHorseExternalId = (url: string | undefined | null) => {
  return url?.match(/\/horse\/([0-9a-zA-Z]+)/)?.[1] ?? null;
};

const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

const parseVenue = (headerText: string) => {
  const match = normalizeText(headerText).match(/^\d+回\s+(.+?)\s+\d+日目/);
  return match?.[1] ?? "不明";
};

const parseCourseAndDistance = (courseDistance: string) => {
  const match = normalizeText(courseDistance).match(/^(.+?)(\d+m)$/);
  return {
    courseText: match?.[1] ?? (courseDistance || null),
    distanceText: match?.[2] ?? null,
  };
};

const parseRaceList = (html: string, date: string): RaceListItem[] => {
  const $ = cheerio.load(html);
  const races: RaceListItem[] = [];

  $(".RaceList_DataList").each((_, raceList) => {
    const venue = parseVenue($(raceList).find(".RaceList_DataHeader").first().text());

    $(raceList)
      .find(".RaceList_DataItem")
      .each((__, item) => {
        const raceLink = $(item).find("a[href*=race_id]").first().attr("href");
        const raceId = extractRaceId(raceLink);
        const raceNumberText = normalizeText($(item).find(".Race_Num").first().text());
        const raceNumber = Number.parseInt(raceNumberText, 10);
        const raceName = normalizeText($(item).find(".RaceList_ItemTitle .ItemTitle").text());
        const startTime = normalizeText($(item).find(".RaceList_Itemtime").text()) || null;
        const courseDistance = normalizeText($(item).find(".RaceList_ItemLong").text());
        const { courseText, distanceText } = parseCourseAndDistance(courseDistance);

        if (!raceId || Number.isNaN(raceNumber) || !raceName) {
          return;
        }

        races.push({
          raceId,
          date,
          venue,
          raceNumber,
          raceName,
          startTime,
          courseText,
          distanceText,
          url: `${NETKEIBA_RACE_BASE_URL}/race/shutuba.html?race_id=${raceId}`,
        });
      });
  });

  return races;
};

const fetchRaceList = async (date: string) => {
  const url = `${NETKEIBA_RACE_BASE_URL}/top/race_list_sub.html?kaisai_date=${date}`;
  const html = await fetchText(url, "utf-8");
  return parseRaceList(html, date);
};

type RaceEntry = {
  horseExternalId: string;
  horseNumber: number | null;
};

const parseRaceEntries = (html: string) => {
  const $ = cheerio.load(html);
  const entries: RaceEntry[] = [];

  $("table.ShutubaTable tr.HorseList").each((_, row) => {
    const horseUrl = $(row).find("td.HorseInfo span.HorseName a").first().attr("href");
    const horseExternalId = extractHorseExternalId(horseUrl);
    const horseNumberText = normalizeText($(row).find("td[class^='Umaban']").first().text());
    const horseNumber = Number.parseInt(horseNumberText, 10);

    if (horseExternalId) {
      entries.push({
        horseExternalId,
        horseNumber: Number.isNaN(horseNumber) ? null : horseNumber,
      });
    }
  });

  return entries;
};

const fetchRaceEntries = async (race: RaceListItem) => {
  const html = await fetchText(race.url, "euc-jp");
  return parseRaceEntries(html);
};

const getDatesFromOptions = (options: CliOptions) => {
  if (options.dates) {
    return {
      weekStart: options.weekStart ?? options.dates[0],
      dates: options.dates,
    };
  }

  if (options.weekStart) {
    const year = Number.parseInt(options.weekStart.slice(0, 4), 10);
    const month = Number.parseInt(options.weekStart.slice(4, 6), 10);
    const day = Number.parseInt(options.weekStart.slice(6, 8), 10);
    const startDate = new Date(Date.UTC(year, month - 1, day));

    return {
      weekStart: options.weekStart,
      dates: [0, 1, 2, 3].map((offset) =>
        formatRaceScheduleDate(addRaceScheduleDays(startDate, offset))
      ),
    };
  }

  return getCurrentRaceScheduleWeek();
};

const getDryRunHorses = (horseExternalIds: string[]): TargetHorse[] => {
  return horseExternalIds.map((externalId, index) => ({
    id: index + 1,
    name: `dry-run-${externalId}`,
    url: `https://db.netkeiba.com/horse/${externalId}`,
  }));
};

const getActiveHorses = async (options: CliOptions): Promise<TargetHorse[]> => {
  if (options.dryRun) {
    return getDryRunHorses(options.horseExternalIds);
  }

  const { default: prisma } = await import("../src/lib/prisma");
  return prisma.horse.findMany({
    where: {
      owners: {
        some: {
          season: {
            isActive: true,
          },
        },
      },
    },
    select: {
      id: true,
      name: true,
      url: true,
    },
  });
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  const { weekStart, dates } = getDatesFromOptions(options);
  console.log(`target weekStart: ${weekStart}`);
  console.log(`target dates: ${dates.join(", ")}`);
  console.log(`dry run: ${options.dryRun}`);
  if (options.maxRaces !== null) {
    console.log(`max races: ${options.maxRaces}`);
  }

  const horses = await getActiveHorses(options);

  const horseByExternalId = new Map(
    horses.flatMap((horse) => {
      const externalId = extractHorseExternalId(horse.url);
      return externalId ? [[externalId, horse] as const] : [];
    })
  );

  console.log(`active horses: ${horses.length}`);
  console.log(`active horses with external id: ${horseByExternalId.size}`);

  const races: RaceListItem[] = [];
  for (const date of dates) {
    const dateRaces = await fetchRaceList(date);
    console.log(`${date}: ${dateRaces.length} races`);
    races.push(...dateRaces);
    await sleep(REQUEST_INTERVAL_MS);
  }

  const targetRaces = options.maxRaces === null ? races : races.slice(0, options.maxRaces);

  const schedules: RaceScheduleInput[] = [];
  const failedRaceUrls: string[] = [];

  for (const race of targetRaces) {
    try {
      const raceEntries = await fetchRaceEntries(race);
      const matchedEntries = raceEntries.flatMap((entry) => {
        const horse = horseByExternalId.get(entry.horseExternalId);
        return horse ? [{ horse, horseNumber: entry.horseNumber }] : [];
      });

      for (const { horse, horseNumber } of matchedEntries) {
        schedules.push({
          ...race,
          horseId: horse.id,
          horseNumber,
          weekStart,
        });
        console.log(
          `matched: ${race.date} ${race.venue} ${race.raceNumber}R ${race.raceName} - ${horse.name}`
        );
      }
    } catch (error) {
      failedRaceUrls.push(race.url);
      console.error(`failed to fetch entries: ${race.url}`);
      console.error(error);
    }

    await sleep(REQUEST_INTERVAL_MS);
  }

  if (options.dryRun) {
    console.log("dry run enabled: skipped RaceSchedule delete/create");
  } else {
    const { default: prisma } = await import("../src/lib/prisma");
    await prisma.$transaction(async (tx) => {
      await tx.raceSchedule.deleteMany({
        where: {
          weekStart,
        },
      });

      if (schedules.length > 0) {
        await tx.raceSchedule.createMany({
          data: schedules.map((schedule) => ({
            horseId: schedule.horseId,
            raceId: schedule.raceId,
            date: schedule.date,
            venue: schedule.venue,
            raceNumber: schedule.raceNumber,
            raceName: schedule.raceName,
            horseNumber: schedule.horseNumber,
            startTime: schedule.startTime,
            courseText: schedule.courseText,
            distanceText: schedule.distanceText,
            url: schedule.url,
            weekStart: schedule.weekStart,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  console.log(`races fetched: ${targetRaces.length}`);
  console.log(`schedules matched: ${schedules.length}`);
  console.log(options.dryRun ? `schedules would save: ${schedules.length}` : `schedules saved: ${schedules.length}`);
  console.log(`failed race urls: ${failedRaceUrls.length}`);

  if (failedRaceUrls.length > 0) {
    for (const url of failedRaceUrls) {
      console.log(`failed: ${url}`);
    }
    process.exitCode = 1;
  }
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (!process.argv.includes("--dry-run")) {
      const { default: prisma } = await import("../src/lib/prisma");
      await prisma.$disconnect();
    }
  });
