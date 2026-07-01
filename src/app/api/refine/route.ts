import { NextResponse } from "next/server";
import { refineSingleIdea } from "@/lib/campaign-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idea, instructions } = body;

    if (!idea || !instructions) {
      return NextResponse.json({ error: "Idea e instrucciones son obligatorias" }, { status: 400 });
    }

    const refined = await refineSingleIdea({ idea, instructions: instructions.trim() });
    return NextResponse.json(refined);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al refinar la propuesta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}