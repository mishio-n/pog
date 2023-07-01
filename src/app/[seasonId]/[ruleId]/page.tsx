import { MenuCard } from "@/components/MenuCard";
import { prisma } from "@/lib/prisma";

type Props = {
  params: {
    seasonId: string;
    ruleId: string;
  };
};

export async function generateStaticParams() {
  const seasons = await prisma.season.findMany();
  const rules = await prisma.rule.findMany();

  const params: { seasonId: string; ruleId: string }[] = [];
  seasons.forEach((s) => {
    rules.forEach((r) => {
      params.push({ seasonId: `${s.id}`, ruleId: `${r.id}` });
    });
  });
  return params;
}

const getOwners = async (params: Props["params"]) => {
  const season = await prisma.season.findUniqueOrThrow({ where: { id: +params.seasonId } });
  const rule = await prisma.rule.findUniqueOrThrow({ where: { id: +params.ruleId } });

  return prisma.owner.findMany({
    where: {
      ruleId: rule.id,
      seasonId: season.id,
    },
  });
};

const getPageData = async (params: Props["params"]) => {
  const owners = await getOwners(params);
  const horses = await prisma.horse.findMany({
    where: {
      owners: {
        some: { id: { in: owners.map((o) => o.id) } },
      },
    },
    include: {
      race: true,
      owners: true,
    },
  });

  return {
    owners,
    horses,
  };
};

const RulePage = async ({ params }: Props) => {
  const { owners, horses } = await getPageData(params);

  return (
    <div className="artboard flex flex-col gap-8">
      {owners.map((owner, i) => (
        <MenuCard
          title={owner.name}
          key={`owner-${owner.id}`}
          strokeColor={"bg-white"}
          strokeStyle="solid"
          to={`${params.seasonId}/${params.ruleId}/${owner.id}`}
        />
      ))}
    </div>
  );
};

export default RulePage;
