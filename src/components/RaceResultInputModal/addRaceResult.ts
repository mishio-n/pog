"use server";

export async function addRaceResult({ raceId }: { raceId: string }) {
  fetch(process.env.LAMBDA_URL || "", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raceId,
    }),
  });
}
