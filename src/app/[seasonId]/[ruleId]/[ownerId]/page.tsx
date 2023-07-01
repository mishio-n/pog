import { prisma } from "@/lib/prisma";

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

const getPageData = async (params: Props["params"]) => {
  const owner = await prisma.owner.findUniqueOrThrow({ where: { id: +params.ownerId } });
  const horses = await prisma.horse.findMany({
    where: {
      owners: {
        every: {
          id: owner.id,
        },
      },
    },
    include: {
      race: true,
    },
  });

  return {
    owner,
    horses,
  };
};

const OwnerPage = async ({ params }: Props) => {
  const { owner, horses } = await getPageData(params);

  return (
    <div className="artboard flex flex-col gap-8">
      <p>{owner.name}</p>
      {horses.map((horse, i) => (
        <span key={horse.id}>{horse.name}</span>
      ))}
    </div>
  );
};

export default OwnerPage;
