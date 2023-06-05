import { db } from "@/lib/db";

const getSeasons = async () => {
  return db.selectFrom("Season").selectAll().execute();
};

const Home = async () => {
  const seasons = await getSeasons();

  return (
    <main>
      <div className="p-5">
        {seasons.map((season) => (
          <div key={season.id}>
            <h2>{season.name}</h2>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Home;
