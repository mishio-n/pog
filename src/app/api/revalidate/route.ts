import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type RevalidateBody = {
  paths?: string[];
  secret?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RevalidateBody;
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (expectedSecret && body.secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!Array.isArray(body.paths)) {
    return NextResponse.json({ error: "paths must be an array" }, { status: 400 });
  }

  const paths = [...new Set(body.paths)].filter((path) => path.startsWith("/"));

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths });
}
