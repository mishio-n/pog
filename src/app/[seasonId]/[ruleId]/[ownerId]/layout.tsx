import { BreadCrumbs } from "@/components/BreadCrumbs";
import { prisma } from "@/lib/prisma";

type Params = {
  seasonId: string;
  ruleId: string;
  ownerId: string;
};

const OwnerLayout = async ({ children, params }: { children: React.ReactNode; params: Params }) => {
  const season = await prisma.season.findUniqueOrThrow({ where: { id: +params.seasonId } });
  const rule = await prisma.rule.findUniqueOrThrow({ where: { id: +params.ruleId } });
  const owner = await prisma.owner.findUniqueOrThrow({ where: { id: +params.ownerId } });
  return (
    <div className="">
      <BreadCrumbs
        paths={[
          {
            slug: `${params.seasonId}/${params.ruleId}`,
            label: `${season.name} ・ ${rule.name}`,
          },
          {
            slug: `${params.seasonId}/${params.ruleId}`,
            label: owner.name,
          },
        ]}
      />
      <div>{children}</div>
    </div>
  );
};

export default OwnerLayout;
