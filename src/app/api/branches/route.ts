import { NextResponse } from "next/server";
import { getBranches } from "@/server/db";

export async function GET() {
  const branches = await getBranches();
  return NextResponse.json(branches);
}
