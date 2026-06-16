import { BreadCrumbs } from "@/components/BreadCrumbs";
import prisma from "@/lib/prisma";
import { aggregateRacePoint } from "@/logic/race-point";
import { HorseDetail } from "./horseDeatil";
import { HorseResult } from "./horseResult";
import { Races } from "./races";

export const revalidate = 86400;

type Props = {
  params: Promise<{
    seasonId: string;
    ruleId: string;
    ownerId: string;
    horseId: string;
  }>;
};

type PageParams = Awaited<Props["params"]>;

export async function generateStaticParams() {
  const owners = await prisma.owner.findMany({ include: { horses: true } });

  const params: PageParams[] = [];
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
  const { seasonId, ruleId, ownerId, horseId } = await params;
  const season = await prisma.season.findUniqueOrThrow({ where: { id: +seasonId } });
  const rule = await prisma.rule.findUniqueOrThrow({ where: { id: +ruleId } });
  const owner = await prisma.owner.findUniqueOrThrow({
    where: { id: +ownerId },
  });
  const horse = await prisma.horse.findUniqueOrThrow({
    where: { id: +horseId },
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
            slug: `${seasonId}/${ruleId}`,
            label: `${season.name} ・ ${rule.name}`,
          },
          {
            slug: `${ownerId}`,
            label: owner.name,
          },
          {
            slug: `${horseId}`,
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
