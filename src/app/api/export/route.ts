import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { CampaignIdea } from "@/types";

function ideaToRow(idea: CampaignIdea, index: number): string {
  const fields = [
    String(index).padStart(4, "0"),
    idea.tema || "",
    idea.titulo || "",
    idea.subtitulo || "",
    idea.mensaje || "",
    idea.copy_facebook || "",
    idea.prompt_flow || "",
  ];
  return fields.map((f) => `"${f.replace(/"/g, '""')}"`).join("|");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "active";
    const campaignId = searchParams.get("campaignId");

    if (type === "history") {
      const campaigns = await db.campaign.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });

      const allItems: CampaignIdea[] = [];
      for (const campaign of campaigns) {
        for (const item of campaign.items) {
          allItems.push({
            tema: item.tema,
            titulo: item.titulo,
            subtitulo: item.subtitulo,
            mensaje: item.mensaje,
            copy_facebook: item.copyFacebook,
            accion: item.accion,
            entorno: item.entorno,
            prompt_flow: item.promptFlow,
          });
        }
      }

      const header = '"Consecutivo"|"Tema"|"Título"|"Subtítulo"|"Frase"|"Entrada Completa (Facebook)"|"Prompt Flow"';
      const rows = allItems.map((item, i) => ideaToRow(item, i + 1));
      const csv = [header, ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="historial_completo_${Date.now()}.csv"`,
        },
      });
    }

    // Active campaign export
    if (!campaignId) {
      return NextResponse.json({ error: "campaignId es obligatorio para exportar activa" }, { status: 400 });
    }

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { items: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    }

    const header = '"Consecutivo"|"Tema"|"Título"|"Subtítulo"|"Frase"|"Entrada Completa (Facebook)"|"Prompt Flow"';
    const rows = campaign.items.map((item, i) =>
      ideaToRow(
        {
          tema: item.tema,
          titulo: item.titulo,
          subtitulo: item.subtitulo,
          mensaje: item.mensaje,
          copy_facebook: item.copyFacebook,
          accion: item.accion,
          entorno: item.entorno,
          prompt_flow: item.promptFlow,
        },
        i + 1
      )
    );
    const csv = [header, ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="campana_${campaign.characterName.replace(/\s+/g, "_")}_${Date.now()}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Error al exportar" }, { status: 500 });
  }
}