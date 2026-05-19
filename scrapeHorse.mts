import puppeteer from "puppeteer";

type Gender = "MALE" | "FEMALE";
type Region = "RITTO" | "MIHO" | "LOCAL" | "OVERSEAS";

const regionMap: Record<string, Region> = {
  栗東: "RITTO",
  美浦: "MIHO",
  地方: "LOCAL",
  海外: "OVERSEAS",
};

const MISSING = "-";

export type HorseInfo = {
  name: string;
  gender: Gender | typeof MISSING;
  id: string;
  stable: string;
  region: Region | typeof MISSING;
};

export const scrapeHorse = async (url: string): Promise<HorseInfo> => {
  // URLから馬IDを抽出 (例: https://db.netkeiba.com/horse/2024105874/, /horse/000a02c8ef/)
  const idMatch = url.match(/\/horse\/([0-9a-zA-Z]+)/);
  if (!idMatch) {
    throw new Error(`URLから馬IDを抽出できませんでした: ${url}`);
  }
  const id = idMatch[1];

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // 馬名: <div class="horse_title"><h1>馬名</h1>...
    const nameRaw = (await page.$eval("div.horse_title h1", (el) => el.textContent ?? "")).trim();
    const name = nameRaw || MISSING;

    // プロフィール文: 例 "現役　牡2歳　鹿毛" / 空欄の場合あり
    const profileText = (
      await page.$eval("div.horse_title p.txt_01", (el) => el.textContent ?? "")
    ).trim();

    // 性別判定 (牡/セ → MALE, 牝 → FEMALE)。判定できなければ "-"
    const genderMatch = profileText.match(/[牡牝セ]/);
    const gender: Gender | typeof MISSING = !genderMatch
      ? MISSING
      : genderMatch[0] === "牝"
      ? "FEMALE"
      : "MALE";

    // 厩舎・地方: db_prof_tableの「調教師」行から取得
    // 例: <td><a ...>手塚貴久</a> (美浦)</td> / 空欄の場合あり
    const trainerText = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll("table.db_prof_table tr"));
      for (const row of rows) {
        const th = row.querySelector("th");
        if (th?.textContent?.trim() === "調教師") {
          return row.querySelector("td")?.textContent?.trim() ?? "";
        }
      }
      return "";
    });
    const stableMatch = trainerText.match(/^(.+?)\s*\((栗東|美浦|地方|海外)\)/);
    const stable = stableMatch ? stableMatch[1].trim() || MISSING : MISSING;
    const region: Region | typeof MISSING = stableMatch ? regionMap[stableMatch[2]] : MISSING;

    return { name, gender, id, stable, region };
  } finally {
    await browser.close();
  }
};

// CLI実行: `npx tsx scrapeHorse.mts <URL>`
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2];
  if (!url) {
    console.error("使い方: npx tsx scrapeHorse.mts <netkeiba馬ページURL>");
    process.exit(1);
  }
  scrapeHorse(url)
    .then((info) => {
      console.log([info.name, info.gender, info.id, info.stable, info.region].join(","));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
