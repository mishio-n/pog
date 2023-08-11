import { BreadCrumbs } from "@/components/BreadCrumbs";
import { prisma } from "@/lib/prisma";
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

// export async function generateStaticParams() {
//   const owners = await prisma.owner.findMany({ include: { horses: true } });

//   const params: Props["params"][] = [];
//   owners.forEach((o) => {
//     const ownerId = `${o.id}`;
//     const ruleId = `${o.ruleId}`;
//     const seasonId = `${o.seasonId}`;

//     o.horses.forEach((h) => {
//       params.push({
//         seasonId,
//         ruleId,
//         ownerId,
//         horseId: `${h.id}`,
//       });
//     });
//   });

//   return params;
// }

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
    ...aggregateRacePoint(horse.races, rule.isDart),
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
        <HorseResult horseWithRacePoint={horseWithRacePoint} />
        <Races horseWithRacePoint={horseWithRacePoint} isDart={rule.isDart} />
      </div>
    </div>
  );
};

export default OwnerPage;
