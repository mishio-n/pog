import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type Body = {
  paths: string[];
};

export async function POST(request: NextRequest) {
  const { paths }: Body = await request.json();

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true }, { status: 200 });
}
