import { BreadCrumbs } from "@/components/BreadCrumbs";
import prisma from "@/lib/prisma";
import { aggregateRacePoint } from "@/logic/race-point";
import { HorseDetail } from "./horseDeatil";
import { HorseResult } from "./horseResult";
import { Races } from "./races";

type Props = {
  params: {
    seasonId: string;
    ruleId: string;
    ownerId: string;
    horseId: string;
  };
};

export async function generateStaticParams() {
  const owners = await prisma.owner.findMany({ include: { horses: true } });

  const params: Props["params"][] = [];
  for (const owner of owners) {
    const ownerId = `${owner.id}`;
    const ruleId = `${owner.ruleId}`;
    const seasonId = `${owner.seasonId}`;

    for (const horse of owner.horses) {
      params.push({
        seasonId,
        ruleId,
        ownerId,
        horseId: `${horse.id}`,
      });
    }
  }

  return params;
}

const OwnerPage = async ({ params }: Props) => {
  const season = await prisma.season.findUniqueOrThrow({ where: { id: +params.seasonId } });
  const rule = await prisma.rule.findUniqueOrThrow({ where: { id: +params.ruleId } });
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: +params.ownerId },
  });
  const horse = await prisma.horse.findUniqueOrThrow({
    where: { id: +params.horseId },
    include: {
      races: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  const horseWithRacePoint = {
    ...horse,
    ...aggregateRacePoint(horse.races, rule.isDart, horse.duplicateCount),
  };

  return (
    <div className="">
      <BreadCrumbs
        paths={[
          {
            slug: `${params.seasonId}/${params.ruleId}`,
            label: `${season.name} ・ ${rule.name}`,
          },
          {
            slug: `${params.ownerId}`,
            label: owner.name,
          },
          {
            slug: `${params.horseId}`,
            label: horse.name,
          },
        ]}
      />

      <div className="artboard flex flex-col">
        <HorseDetail horse={horse} />
        <HorseResult horseWithRacePoint={horseWithRacePoint} isDuplicate={rule.isDuplicate} />
        <Races horseWithRacePoint={horseWithRacePoint} isDart={rule.isDart} />
      </div>
    </div>
  );
};

export default OwnerPage;
