import { BreadCrumbs } from "@/components/BreadCrumbs";
import prisma from "@/lib/prisma";
import { aggregateRacePoint } from "@/logic/race-point";
import { Horses } from "./horses";
import { OddsSwitcher } from "./oddsSwitcher";
import { OddsSwitchProvider } from "./oddsSwitchProvider";
import { OwnerResult } from "./ownerResult";

type Props = {
  params: Promise<{
    seasonId: string;
    ruleId: string;
    ownerId: string;
  }>;
};

type PageParams = Awaited<Props["params"]>;

export async function generateStaticParams() {
  const owners = await prisma.owner.findMany();

  const params: PageParams[] = owners.map((o) => ({
    ownerId: `${o.id}`,
    ruleId: `${o.ruleId}`,
    seasonId: `${o.seasonId}`,
  }));

  return params;
}

const OwnerPage = async ({ params }: Props) => {
  const { seasonId, ruleId, ownerId } = await params;
  const season = await prisma.season.findUniqueOrThrow({ where: { id: +seasonId } });
  const rule = await prisma.rule.findUniqueOrThrow({ where: { id: +ruleId } });
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: +ownerId },
    include: { horses: { include: { races: true } } },
  });

  const horsesWithRacePoint = owner.horses
    .map((horse) => ({
      ...horse,
      ...aggregateRacePoint(horse.races, rule.isDart, horse.duplicateCount),
    }))
    .sort((a, b) => b.totalPoint - a.totalPoint);

  return (
    <div className="">
      <BreadCrumbs
        paths={[
          {
            slug: `${seasonId}/${ruleId}`,
            label: `${season.name} ・ ${rule.name}`,
          },
          {
            slug: `${ownerId}`,
            label: owner.name,
          },
        ]}
      />

      <div className="artboard flex flex-col">
        <OddsSwitchProvider>
          <OddsSwitcher />
          <OwnerResult horsesWithRacePoint={horsesWithRacePoint} />
          <Horses
            horsesWithRacePoint={horsesWithRacePoint}
            basePath={`/${season.id}/${rule.id}/${owner.id}`}
          />
        </OddsSwitchProvider>
      </div>
    </div>
  );
};

export default OwnerPage;
