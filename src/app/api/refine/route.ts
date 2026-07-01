import { NextResponse } from "next/server";
import { refineSingleIdea } from "@/lib/campaign-service";
import type { GeminiModel } from "@/store/campaign-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idea, instructions, apiKey, model } = body;

    if (!idea || !instructions) {
      return NextResponse.json({ error: "Idea e instrucciones son obligatorias" }, { status: 400 });
    }

    const refined = await refineSingleIdea({
      idea,
      instructions: instructions.trim(),
      apiKey: apiKey || undefined,
      model: model as GeminiModel | undefined,
    });
    return NextResponse.json(refined);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al refinar la propuesta.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}