import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { PHOTO_STYLES } from "@/types";
import type { EnfoqueType, CopyLengthType, PhotoStyleType, CampaignIdea } from "@/types";

export async function generateCampaignContent(params: {
  characterName: string;
  characterDesc: string;
  characterImgUrls: string[];
  numMessages: number;
  photoStyle: PhotoStyleType;
  topics: string;
  enfoque: EnfoqueType;
  copyLength: CopyLengthType;
  facebookFooter: string;
  facebookHashtags: string;
}): Promise<CampaignIdea[]> {
  const {
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
  } = params;

  const zai = await ZAI.create();

  const systemPrompt = `Eres un estratega de contenidos digitales y experto en agroecología, radio comunitaria y tradiciones latinoamericanas. Tu misión es redactar piezas de contenido perfectas para redes sociales. El formato de salida debe ser JSON estricto cumpliendo el esquema solicitado.`;

  let topicsClause = "";
  if (topics) {
    topicsClause = `El usuario ha establecido los siguientes temas o enfoques: "${topics}". 
Debes distribuir estos temas de manera equitativa e inteligente entre las ${numMessages} propuestas a generar. 
Cada propuesta abordará un tema o aspecto específico derivado de esa lista. Debes documentar claramente el tema del que trata esta propuesta específica en la propiedad "tema" (ej. "Manejo Integrado de Plagas", "Cuidado del Agua", "Abono Orgánico").`;
  } else {
    topicsClause = `Debes autogenerar de forma variada enfoques de la vida del campo acordes a la personalidad del personaje y documentar el tema específico en la propiedad "tema" (ej. "Cosecha Silvestre", "Sabiduría de la Luna", "Remedios para Animales").`;
  }

  let depthInstructions = "";
  if (enfoque === "consejo") {
    depthInstructions = `El estilo de redacción de toda la campaña debe ser obligatoriamente 'TIPO CONSEJO'. 
- El lenguaje debe ser sumamente sencillo, amigable, cálido, utilizando el vocabulario cotidiano, folclórico y tradicional del campesino. 
- La temática debe ser sumamente común, cotidiana de la vida en el campo y de muy fácil asimilación.`;
  } else if (enfoque === "tecnico") {
    depthInstructions = `El estilo de redacción de toda la campaña debe ser obligatoriamente 'TIPO TÉCNICO'. 
- El lenguaje debe ser muy claro pero incorporar terminología especializada de agronomía o zootecnia de manera comprensible y didáctica. 
- Las temáticas deben ser más avanzadas y de valor especializado.`;
  } else if (enfoque === "tutorial") {
    depthInstructions = `El estilo de redacción de toda la campaña debe ser obligatoriamente 'TIPO TUTORIAL'. 
- La estructura del consejo ("mensaje") debe esbozar un proceso o instructivo de máximo 4 pasos sencillos y muy ordenados usando números (ej: 1. Paso... 2. Paso... 3. Paso... 4. Paso...).
- El lenguaje debe ser directo, práctico, explicativo y con vocabulario muy dinámico que motive a la inmediata ejecución de la tarea agrícola.`;
  }

  let lengthText = "";
  if (copyLength === "corto") {
    lengthText = `La extensión del campo "copy_facebook" debe ser obligatoriamente CORTA (entre 100 y 150 caracteres). Ve directo al grano con un tono amigable, ágil y de alto impacto.`;
  } else if (copyLength === "medio") {
    lengthText = `La extensión del campo "copy_facebook" debe ser obligatoriamente MEDIA (entre 200 y 350 caracteres). Redáctalo con la calidez tradicional de un locutor de radio de pueblo.`;
  } else if (copyLength === "largo") {
    lengthText = `La extensión del campo "copy_facebook" debe ser obligatoriamente LARGA (entre 400 y 600 caracteres). Desarrolla una narrativa rural más profunda.`;
  }

  const userQuery = `Basándote en el personaje actual y la descripción de su perfil, genera exactamente ${numMessages} propuestas de contenido únicas para flyers y redes sociales (Facebook).
      
${topicsClause}

${depthInstructions}

${lengthText}

Personaje actual: ${characterName}
Perfil de Referencia: ${characterDesc}

Debes imitar a la perfección esta estructura y tono de redacción campesino auténtico:
- titulo: "Como hacer la siembra optima del Platano"
- subtitulo: "Obtenga una buena cosecha de Platanos con estos consejos."
- mensaje: "Si siembras el plátano en menguante tu cosecha tendrá un buen desarrollo, un tamaño excepcional, no te olvides de fumigar en verano."

Además de la estructura del flyer, debes generar obligatoriamente el campo "copy_facebook", el cual es el texto para el pie de foto de la publicación de Facebook según la extensión solicitada. 
Debe incluir:
1. Una introducción amigable con saludos típicos del campo.
2. La explicación y sustento del consejo de manera cercana.
3. Un llamado a la acción (CTA) invitándolos a sintonizar la emisora para más secretos de la tierra.
4. Al final, incluye de 3 a 5 hashtags temáticos y relevantes autogenerados por la IA.

Para cada una de las ${numMessages} propuestas debes proporcionar obligatoriamente estos 7 campos en español e inglés según corresponda:
1. "tema": El nombre del tema de este post específico de forma clara y resumida (ej: "Control de Humedad", "Siembra Directa").
2. "titulo": Un título corto y llamativo en español sobre el tema del consejo (máximo 50 caracteres).
3. "subtitulo": Un subtítulo explicativo de valor en español que resuma el beneficio directo del consejo (máximo 85 caracteres).
4. "mensaje": La frase corta/consejo tradicional en la voz folclórica característica de este personaje o formato tutorial según se solicitó (máximo 140 caracteres).
5. "copy_facebook": El pie de foto detallado para Facebook en español (con emojis, llamado a la acción y hashtags autogenerados).
6. "accion": Una acción física descriptiva en inglés (tercera persona) que represente al personaje realizando la actividad de forma de ilustración limpia.
7. "entorno": El entorno o fondo de la ilustración en inglés adaptado al consejo (Ej: cinematic lighting, realistic style).

Devuelve la información estructurada en JSON con este esquema exacto:
{
  "ideas": [
    {
      "tema": "Tema de la propuesta",
      "titulo": "Título en español",
      "subtitulo": "Subtítulo en español",
      "mensaje": "Frase corta o pasos en español",
      "copy_facebook": "Pie de foto para Facebook con emojis, llamado a la acción y hashtags autogenerados",
      "accion": "Action in English",
      "entorno": "Setting in English"
    }
  ]
}`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: "assistant", content: systemPrompt },
      { role: "user", content: userQuery },
    ],
    thinking: { type: "disabled" },
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) throw new Error("No se recibió respuesta válida del motor de IA.");

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("La respuesta de la IA no contiene JSON válido.");

  const rawCampaignData = JSON.parse(jsonMatch[0]);
  const ideas: CampaignIdea[] = rawCampaignData.ideas || [];

  const styleDirective = PHOTO_STYLES[photoStyle] || PHOTO_STYLES.cinematic;

  const validImages = characterImgUrls.filter((u) => u.trim().length > 0);
  let imagePrefix = "";
  if (validImages.length === 1) imagePrefix = `Using this character reference image ${validImages[0]} `;
  else if (validImages.length > 1)
    imagePrefix = `Using these character reference images ${validImages.join(", ")} `;

  const processedIdeas = ideas.map((idea: CampaignIdea) => {
    let copyFb = idea.copy_facebook || "";
    if (facebookFooter) copyFb += "\n\n" + facebookFooter;
    if (facebookHashtags) copyFb += "\n" + facebookHashtags;

    const actionText = idea.accion || "";
    const settingText = idea.entorno || "";
    const promptFlow = `${imagePrefix}based on character description: ${characterDesc}. Act as this character. The character is ${actionText}. Setting: ${settingText}. ${styleDirective}`;

    return {
      ...idea,
      copy_facebook: copyFb,
      prompt_flow: promptFlow,
    };
  });

  return processedIdeas;
}

export async function refineSingleIdea(params: {
  idea: CampaignIdea;
  instructions: string;
}): Promise<CampaignIdea> {
  const { idea, instructions } = params;
  const zai = await ZAI.create();

  const agentPrompt = `Modifica la siguiente propuesta de contenido rural en base a estas instrucciones estrictas del usuario: "${instructions}".
Propuesta actual:
{
  "tema": "${idea.tema}",
  "titulo": "${idea.titulo}",
  "subtitulo": "${idea.subtitulo}",
  "mensaje": "${idea.mensaje}",
  "copy_facebook": "${(idea.copy_facebook || "").replace(/\n/g, "\\n")}",
  "accion": "${idea.accion || ""}",
  "entorno": "${idea.entorno || ""}"
}

Devuelve obligatoriamente un JSON estricto únicamente con la propuesta corregida manteniendo las mismas claves:
{
  "tema": "Tema corregido si aplica",
  "titulo": "Título corregido",
  "subtitulo": "Subtítulo corregido",
  "mensaje": "Mensaje corregido",
  "copy_facebook": "Pie de foto corregido",
  "accion": "Action in English",
  "entorno": "Setting in English"
}`;

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: "assistant",
        content:
          "Eres un estratega de contenidos digitales y experto en agroecología. Modifica propuestas de contenido respetando el formato JSON.",
      },
      { role: "user", content: agentPrompt },
    ],
    thinking: { type: "disabled" },
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) throw new Error("No se recibió respuesta válida al refinar.");

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("La respuesta de refinamiento no contiene JSON válido.");

  return JSON.parse(jsonMatch[0]);
}

export async function saveCampaign(params: {
  characterId: string;
  characterName: string;
  characterDesc: string;
  enfoque: string;
  photoStyle: string;
  copyLength: string;
  facebookFooter: string;
  facebookHashtags: string;
  ideas: CampaignIdea[];
}) {
  const campaign = await db.campaign.create({
    data: {
      characterId: params.characterId,
      characterName: params.characterName,
      characterDesc: params.characterDesc,
      enfoque: params.enfoque,
      photoStyle: params.photoStyle,
      copyLength: params.copyLength,
      facebookFooter: params.facebookFooter,
      facebookHashtags: params.facebookHashtags,
      items: {
        create: params.ideas.map((idea) => ({
          tema: idea.tema,
          titulo: idea.titulo,
          subtitulo: idea.subtitulo,
          mensaje: idea.mensaje,
          copyFacebook: idea.copy_facebook,
          accion: idea.accion,
          entorno: idea.entorno,
          promptFlow: idea.prompt_flow || "",
        })),
      },
    },
    include: { items: true },
  });

  return campaign;
}

export async function getAllHistory(): Promise<CampaignIdea[]> {
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
  return allItems;
}

export async function getHistoryCount(): Promise<number> {
  return db.campaignItem.count();
}