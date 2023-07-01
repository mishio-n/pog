import { BreadCrumbs } from "@/components/BreadCrumbs";
import { prisma } from "@/lib/prisma";
import { aggregateRacePoint } from "@/logic/race-point";
import { Horses } from "./horses";
import { OddsSwitchProvider } from "./oddsSwitchProvider";
import { OddsSwitcher } from "./oddsSwitcher";
import { OwnerResult } from "./ownerResult";

type Props = {
  params: {
    seasonId: string;
    ruleId: string;
    ownerId: string;
  };
};

export async function generateStaticParams(p: any) {
  const owners = await prisma.owner.findMany();

  const params: Props["params"][] = owners.map((o) => ({
    ownerId: `${o.id}`,
    ruleId: `${o.ruleId}`,
    seasonId: `${o.seasonId}`,
  }));

  return params;
}

const OwnerPage = async ({ params }: Props) => {
  const season = await prisma.season.findUniqueOrThrow({ where: { id: +params.seasonId } });
  const rule = await prisma.rule.findUniqueOrThrow({ where: { id: +params.ruleId } });
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: +params.ownerId },
    include: { horses: { include: { races: true } } },
  });

  const horsesWithRacePoint = owner.horses
    .map((horse) => ({
      ...horse,
      ...aggregateRacePoint(horse.races, rule.isDart),
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
          {
            slug: `${params.seasonId}/${params.ruleId}/${params.ownerId}`,
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
