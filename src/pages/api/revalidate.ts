import { NextApiHandler } from "next";

const revalidate: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).end();
  }

  console.log(req.body);
  const paths = req.body.paths as string[];

  for (const path of paths) {
    await res.revalidate(path);
  }

  return res.json({ revalidated: true });
};

export default revalidate;
