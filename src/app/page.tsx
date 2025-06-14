import { MenuCard } from "@/app/menuCard";
import { SeasonSection } from "@/app/seasonSection";
import { kysely } from "@/lib/kysely";

const getSeasons = async () => {
  return kysely
    .selectFrom("Season")
    .where("isActive", "=", true)
    .selectAll()
    .orderBy("id", "desc")
    .execute();
};

const getRules = async () => {
  return kysely.selectFrom("Rule").selectAll().execute();
};

const theme = [
  {
    strokeColor: "border-lime-500",
  },
  {
    strokeColor: "border-orange-200",
  },
  {
    strokeColor: "border-purple-200",
  },
];

const Home = async () => {
  const seasons = await getSeasons();
  const rules = await getRules();

  return (
    <div className="artboard flex flex-col gap-8">
      {seasons.map((season, i) => (
        <div key={season.id}>
          <SeasonSection name={season.name} />
          {rules.map((rule, j) => (
            <MenuCard
              title={rule.name}
              key={`${season.id}-${rule.id}`}
              strokeColor={theme[j].strokeColor}
              strokeStyle="solid"
              to={`/${season.id}/${rule.id}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Home;
