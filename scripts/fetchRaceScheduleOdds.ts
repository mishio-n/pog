import * as cheerio from "cheerio";
import { getCurrentRaceScheduleWeek } from "../src/lib/raceScheduleWeek";

type CliOptions = {
  dryRun: boolean;
  force: boolean;
  raceIds: string[];
  horseExternalIds: string[];
  maxRaces: number | null;
};

type RaceEntry = {
  horseExternalId: string;
  horseNumber: number | null;
};

type OddsRow = {
  odds: number;
  popularity: number | null;
};

type OddsResponse = {
  status: string;
  data:
    | {
        official_datetime?: string;
        odds?: Record<string, Record<string, [string, string, string]>>;
      }
    | string;
  reason?: string;
};

const NETKEIBA_RACE_BASE_URL = "https://race.netkeiba.com";
const REQUEST_INTERVAL_MS = 500;
let disconnectPrisma: (() => Promise<void>) | null = null;

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
    force: false,
    raceIds: [],
    horseExternalIds: [],
    maxRaces: null,
  };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--force") {
      options.force = true;
      continue;
    }

    const [key, value] = arg.split("=");

    switch (key) {
      case "--race-ids":
        options.raceIds.push(...parseCsvOption(value));
        break;
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
      case "--max-races":
        options.maxRaces = value ? Number.parseInt(value, 10) : null;
        break;
    }
  }

  options.raceIds.push(...parseCsvOption(process.env.DRY_RUN_RACE_IDS));
  options.horseExternalIds.push(...parseCsvOption(process.env.DRY_RUN_HORSE_EXTERNAL_IDS));
  options.horseExternalIds.push(
    ...parseCsvOption(process.env.DRY_RUN_HORSE_URLS).flatMap((url) => {
      const externalId = extractHorseExternalId(url);
      return externalId ? [externalId] : [];
    })
  );

  options.raceIds = [...new Set(options.raceIds)];
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

const fetchJson = async <T>(url: string) => {
  const response = await fetch(url, {
    headers: {
      referer: `${NETKEIBA_RACE_BASE_URL}/race/shutuba.html`,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};

const extractHorseExternalId = (url: string | undefined | null) => {
  return url?.match(/\/horse\/([0-9a-zA-Z]+)/)?.[1] ?? null;
};

const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();

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

const fetchRaceEntries = async (raceId: string) => {
  const html = await fetchText(`${NETKEIBA_RACE_BASE_URL}/race/shutuba.html?race_id=${raceId}`, "euc-jp");
  return parseRaceEntries(html);
};

const parseOfficialDatetime = (officialDatetime: string | undefined) => {
  return officialDatetime ? new Date(`${officialDatetime.replace(" ", "T")}+09:00`) : null;
};

const fetchRaceOdds = async (raceId: string) => {
  const url = `${NETKEIBA_RACE_BASE_URL}/api/api_get_jra_odds.html?${new URLSearchParams({
    pid: "api_get_jra_odds",
    input: "UTF-8",
    output: "json",
    race_id: raceId,
    type: "1",
    action: "update",
    sort: "odds",
    compress: "0",
  })}`;
  const response = await fetchJson<OddsResponse>(url);

  if (typeof response.data === "string") {
    throw new Error(`Compressed odds response is not supported: ${raceId}`);
  }

  const winOdds = response.data.odds?.["1"] ?? {};
  const oddsByHorseNumber = new Map<number, OddsRow>();

  for (const [horseNumberKey, row] of Object.entries(winOdds)) {
    const horseNumber = Number.parseInt(horseNumberKey, 10);
    const odds = Number.parseFloat(row[0]);
    const popularity = Number.parseInt(row[2], 10);

    if (!Number.isNaN(horseNumber) && !Number.isNaN(odds)) {
      oddsByHorseNumber.set(horseNumber, {
        odds,
        popularity: Number.isNaN(popularity) ? null : popularity,
      });
    }
  }

  return {
    status: response.status,
    officialAt: parseOfficialDatetime(response.data.official_datetime),
    oddsByHorseNumber,
  };
};

const getTokyoParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekday = values.weekday;

  return {
    weekday,
    hour: Number.parseInt(values.hour, 10),
    minute: Number.parseInt(values.minute, 10),
  };
};

const isWithinOddsUpdateWindow = (date = new Date()) => {
  const { weekday, hour, minute } = getTokyoParts(date);

  if (weekday !== "Sat" && weekday !== "Sun") {
    return false;
  }

  if (hour < 7) {
    return false;
  }

  return hour < 16 || (hour === 16 && minute === 0);
};

const parseRaceDateTime = (date: string, startTime: string) => {
  const year = date.slice(0, 4);
  const month = date.slice(4, 6);
  const day = date.slice(6, 8);
  return new Date(`${year}-${month}-${day}T${startTime}:00+09:00`);
};

const runDryRun = async (options: CliOptions) => {
  const raceIds = options.maxRaces === null ? options.raceIds : options.raceIds.slice(0, options.maxRaces);

  console.log(`dry run race ids: ${raceIds.join(", ")}`);
  console.log(`dry run horse external ids: ${options.horseExternalIds.join(", ") || "(none)"}`);

  for (const raceId of raceIds) {
    const entries = await fetchRaceEntries(raceId);
    const odds = await fetchRaceOdds(raceId);

    console.log(`race ${raceId}: entries=${entries.length} odds=${odds.oddsByHorseNumber.size}`);

    for (const horseExternalId of options.horseExternalIds) {
      const entry = entries.find((item) => item.horseExternalId === horseExternalId);
      const row = entry?.horseNumber ? odds.oddsByHorseNumber.get(entry.horseNumber) : null;
      console.log(
        `horse ${horseExternalId}: horseNumber=${entry?.horseNumber ?? "-"} odds=${row?.odds ?? "-"} popularity=${row?.popularity ?? "-"}`
      );
    }

    await sleep(REQUEST_INTERVAL_MS);
  }
};

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  console.log(`dry run: ${options.dryRun}`);
  console.log(`force: ${options.force}`);

  if (options.dryRun) {
    await runDryRun(options);
    return;
  }

  if (!options.force && !isWithinOddsUpdateWindow()) {
    console.log("outside odds update window: skipped");
    return;
  }

  const { default: prisma } = await import("../src/lib/prisma");
  disconnectPrisma = () => prisma.$disconnect();
  const { weekStart } = getCurrentRaceScheduleWeek();
  const now = new Date();

  const schedules = await prisma.raceSchedule.findMany({
    where: {
      weekStart,
      startTime: {
        not: null,
      },
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
        select: {
          id: true,
          name: true,
          url: true,
        },
      },
    },
    orderBy: [{ date: "asc" }, { venue: "asc" }, { raceNumber: "asc" }],
  });

  const futureSchedules = schedules.filter((schedule) => {
    return schedule.startTime && now < parseRaceDateTime(schedule.date, schedule.startTime);
  });

  const raceIds = [...new Set(futureSchedules.map((schedule) => schedule.raceId))];
  const targetRaceIds = options.maxRaces === null ? raceIds : raceIds.slice(0, options.maxRaces);

  console.log(`target weekStart: ${weekStart}`);
  console.log(`future schedules: ${futureSchedules.length}`);
  console.log(`target races: ${targetRaceIds.length}`);

  const failedRaceIds: string[] = [];
  let updatedCount = 0;

  for (const raceId of targetRaceIds) {
    const raceSchedules = futureSchedules.filter((schedule) => schedule.raceId === raceId);

    try {
      const entries = await fetchRaceEntries(raceId);
      const entryByExternalId = new Map(entries.map((entry) => [entry.horseExternalId, entry]));
      const raceOdds = await fetchRaceOdds(raceId);
      const oddsFetchedAt = new Date();

      for (const schedule of raceSchedules) {
        const horseExternalId = extractHorseExternalId(schedule.horse.url);
        const entry = horseExternalId ? entryByExternalId.get(horseExternalId) : null;
        const horseNumber = entry?.horseNumber ?? schedule.horseNumber;
        const oddsRow = horseNumber ? raceOdds.oddsByHorseNumber.get(horseNumber) : null;

        if (!horseNumber) {
          console.log(`horse number not found: ${raceId} ${schedule.horse.name}`);
          continue;
        }

        if (!oddsRow) {
          console.log(`odds not found: ${raceId} ${schedule.horse.name} horseNumber=${horseNumber}`);
          await prisma.raceSchedule.update({
            where: {
              id: schedule.id,
            },
            data: {
              horseNumber,
            },
          });
          continue;
        }

        await prisma.raceSchedule.update({
          where: {
            id: schedule.id,
          },
          data: {
            horseNumber,
            odds: oddsRow.odds,
            popularity: oddsRow.popularity,
            oddsFetchedAt,
            oddsOfficialAt: raceOdds.officialAt,
          },
        });
        updatedCount++;
        console.log(
          `updated: ${raceId} ${schedule.horse.name} horseNumber=${horseNumber} odds=${oddsRow.odds} popularity=${oddsRow.popularity ?? "-"}`
        );
      }
    } catch (error) {
      failedRaceIds.push(raceId);
      console.error(`failed to update odds: ${raceId}`);
      console.error(error);
    }

    await sleep(REQUEST_INTERVAL_MS);
  }

  console.log(`updated schedules: ${updatedCount}`);
  console.log(`failed races: ${failedRaceIds.length}`);

  if (failedRaceIds.length > 0) {
    for (const raceId of failedRaceIds) {
      console.log(`failed: ${raceId}`);
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
    if (disconnectPrisma) {
      await disconnectPrisma();
    }
  });
