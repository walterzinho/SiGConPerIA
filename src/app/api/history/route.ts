import { NextResponse } from "next/server";
import { getHistoryCount } from "@/lib/campaign-service";

export async function GET() {
  try {
    const count = await getHistoryCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}

export async function DELETE() {
  try {
    const { db } = await import("@/lib/db");
    await db.campaignItem.deleteMany({});
    await db.campaign.deleteMany({});
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al limpiar historial" }, { status: 500 });
  }
}