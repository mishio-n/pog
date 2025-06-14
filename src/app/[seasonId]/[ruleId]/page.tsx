import { BreadCrumbs } from "@/components/BreadCrumbs";
import prisma from "@/lib/prisma";
import { aggregateRacePoint } from "@/logic/race-point";
import { Owners } from "./owners";

type Props = {
  params: {
    seasonId: string;
    ruleId: string;
  };
};

export async function generateStaticParams() {
  const seasons = await prisma.season.findMany({ where: { isActive: true } });
  const rules = await prisma.rule.findMany();

  const params: { seasonId: string; ruleId: string }[] = [];
  for (const season of seasons) {
    for (const rule of rules) {
      params.push({ seasonId: `${season.id}`, ruleId: `${rule.id}` });
    }
  }
  return params;
}

const OwnersPage = async ({ params }: Props) => {
  const season = await prisma.season.findUniqueOrThrow({ where: { id: +params.seasonId } });
  const rule = await prisma.rule.findUniqueOrThrow({ where: { id: +params.ruleId } });
  const owners = await prisma.owner.findMany({
    where: {
      ruleId: rule.id,
      seasonId: season.id,
    },
    include: {
      horses: {
        include: {
          races: true,
        },
      },
    },
  });

  // 獲得ポイントの集計
  const ownerWithPoints = owners
    .map((owner) => ({
      ...owner,
      totalPoint: owner.horses.reduce(
        (result, horse) =>
          result + aggregateRacePoint(horse.races, rule.isDart, horse.duplicateCount).totalPoint,
        0
      ),
      totalDuplicateCount: owner.horses.reduce((result, horse) => result + horse.duplicateCount, 0),
    }))
    .sort((a, b) => b.totalPoint - a.totalPoint);

  return (
    <div className="">
      <BreadCrumbs
        paths={[
          {
            slug: `${params.seasonId}/${params.ruleId}`,
            label: `${season.name} ・ ${rule.name}`,
          },
        ]}
      />
      <div className="artboard flex flex-col gap-2">
        <Owners
          ownerWithPoints={ownerWithPoints}
          basePath={`/${season.id}/${rule.id}`}
          isDuplicate={rule.isDuplicate}
        />
      </div>
    </div>
  );
};

export default OwnersPage;
