import { NextResponse } from "next/server";
import { generateCampaignContent, saveCampaign } from "@/lib/campaign-service";
import type { PhotoStyleType, EnfoqueType, CopyLengthType } from "@/types";
import type { GeminiModel } from "@/store/campaign-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      characterId,
      characterName,
      characterDesc,
      characterImgUrls,
      numMessages,
      photoStyle,
      topics,
      enfoque,
      copyLength,
      facebookFooter,
      facebookHashtags,
      apiKey,
      model,
    } = body;

    if (!characterName || !characterDesc) {
      return NextResponse.json({ error: "Selecciona un personaje válido" }, { status: 400 });
    }
    if (!numMessages || numMessages < 1 || numMessages > 20) {
      return NextResponse.json({ error: "El número de mensajes debe ser entre 1 y 20" }, { status: 400 });
    }

    const ideas = await generateCampaignContent({
      characterName,
      characterDesc,
      characterImgUrls: characterImgUrls || [],
      numMessages: Number(numMessages),
      photoStyle: (photoStyle || "cinematic") as PhotoStyleType,
      topics: topics || "",
      enfoque: (enfoque || "consejo") as EnfoqueType,
      copyLength: (copyLength || "medio") as CopyLengthType,
      facebookFooter: facebookFooter || "",
      facebookHashtags: facebookHashtags || "",
      apiKey: apiKey || undefined,
      model: model as GeminiModel | undefined,
    });

    const campaign = await saveCampaign({
      characterId: characterId || "",
      characterName,
      characterDesc,
      enfoque: enfoque || "consejo",
      photoStyle: photoStyle || "cinematic",
      copyLength: copyLength || "medio",
      facebookFooter: facebookFooter || "",
      facebookHashtags: facebookHashtags || "",
      ideas,
    });

    return NextResponse.json({
      campaignId: campaign.id,
      ideas,
      meta: {
        characterName,
        enfoque: (enfoque || "consejo").toUpperCase(),
        copyLength: (copyLength || "medio").toUpperCase(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "API_KEY_REQUERIDA") {
      return NextResponse.json({
        error: "API_KEY_REQUERIDA",
        friendlyMessage: "Esta plataforma no tiene IA integrada. Ingresa tu API Key de Gemini en la sección de configuración para poder generar contenido.",
      }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Error desconocido en el llamado API.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}