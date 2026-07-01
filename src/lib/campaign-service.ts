import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";
import { PHOTO_STYLES } from "@/types";
import type { EnfoqueType, CopyLengthType, PhotoStyleType, CampaignIdea } from "@/types";
import type { GeminiModel } from "@/store/campaign-store";

/* ── Prompt Builders ─────────────────────────────────────────── */

function buildSystemPrompt(): string {
  return "Eres un estratega de contenidos digitales y experto en agroecología, radio comunitaria y tradiciones latinoamericanas. Tu misión es redactar piezas de contenido perfectas para redes sociales. El formato de salida debe ser JSON estricto cumpliendo el esquema solicitado.";
}

function buildUserPrompt(params: {
  characterName: string;
  characterDesc: string;
  numMessages: number;
  topics: string;
  enfoque: EnfoqueType;
  copyLength: CopyLengthType;
}): string {
  const { characterName, characterDesc, numMessages, topics, enfoque, copyLength } = params;

  let topicsClause = "";
  if (topics) {
    topicsClause = 'El usuario ha establecido los siguientes temas o enfoques: "' + topics + '". \nDebes distribuir estos temas de manera equitativa e inteligente entre las ' + numMessages + ' propuestas a generar. \nCada propuesta abordará un tema o aspecto específico derivado de esa lista. Debes documentar claramente el tema del que trata esta propuesta específica en la propiedad "tema" (ej. "Manejo Integrado de Plagas", "Cuidado del Agua", "Abono Orgánico").';
  } else {
    topicsClause = 'Debes autogenerar de forma variada enfoques de la vida del campo acordes a la personalidad del personaje y documentar el tema específico en la propiedad "tema" (ej. "Cosecha Silvestre", "Sabiduría de la Luna", "Remedios para Animales").';
  }

  let depthInstructions = "";
  if (enfoque === "consejo") {
    depthInstructions = "El estilo de redacción de toda la campaña debe ser obligatoriamente 'TIPO CONSEJO'. \n- El lenguaje debe ser sumamente sencillo, amigable, cálido, utilizando el vocabulario cotidiano, folclórico y tradicional del campesino. \n- La temática debe ser sumamente común, cotidiana de la vida en el campo y de muy fácil asimilación.";
  } else if (enfoque === "tecnico") {
    depthInstructions = "El estilo de redacción de toda la campaña debe ser obligatoriamente 'TIPO TÉCNICO'. \n- El lenguaje debe ser muy claro pero incorporar terminología especializada de agronomía o zootecnia de manera comprensible y didáctica. \n- Las temáticas deben ser más avanzadas y de valor especializado.";
  } else if (enfoque === "tutorial") {
    depthInstructions = "El estilo de redacción de toda la campaña debe ser obligatoriamente 'TIPO TUTORIAL'. \n- La estructura del consejo (\"mensaje\") debe esbozar un proceso o instructivo de máximo 4 pasos sencillos y muy ordenados usando números (ej: 1. Paso... 2. Paso... 3. Paso... 4. Paso...).\n- El lenguaje debe ser directo, práctico, explicativo y con vocabulario muy dinámico que motive a la inmediata ejecución de la tarea agrícola.";
  }

  let lengthText = "";
  if (copyLength === "corto") {
    lengthText = 'La extensión del campo "copy_facebook" debe ser obligatoriamente CORTA (entre 100 y 150 caracteres). Ve directo al grano con un tono amigable, ágil y de alto impacto.';
  } else if (copyLength === "medio") {
    lengthText = 'La extensión del campo "copy_facebook" debe ser obligatoriamente MEDIA (entre 200 y 350 caracteres). Redáctalo con la calidez tradicional de un locutor de radio de pueblo.';
  } else if (copyLength === "largo") {
    lengthText = 'La extensión del campo "copy_facebook" debe ser obligatoriamente LARGA (entre 400 y 600 caracteres). Desarrolla una narrativa rural más profunda.';
  }

  return "Basándote en el personaje actual y la descripción de su perfil, genera exactamente " + numMessages + " propuestas de contenido únicas para flyers y redes sociales (Facebook).\n\n" + topicsClause + "\n\n" + depthInstructions + "\n\n" + lengthText + "\n\nPersonaje actual: " + characterName + "\nPerfil de Referencia: " + characterDesc + '\n\nDebes imitar a la perfección esta estructura y tono de redacción campesino auténtico:\n- titulo: "Como hacer la siembra optima del Platano"\n- subtitulo: "Obtenga una buena cosecha de Platanos con estos consejos."\n- mensaje: "Si siembras el plátano en menguante tu cosecha tendrá un buen desarrollo, un tamaño excepcional, no te olvides de fumigar en verano."\n\nAdemás de la estructura del flyer, debes generar obligatoriamente el campo "copy_facebook", el cual es el texto para el pie de foto de la publicación de Facebook según la extensión solicitada.\nDebe incluir:\n1. Una introducción amigable con saludos típicos del campo.\n2. La explicación y sustento del consejo de manera cercana.\n3. Un llamado a la acción (CTA) invitándolos a sintonizar la emisora para más secretos de la tierra.\n4. Al final, incluye de 3 a 5 hashtags temáticos y relevantes autogenerados por la IA.\n\nPara cada una de las ' + numMessages + ' propuestas debes proporcionar obligatoriamente estos 7 campos en español e inglés según corresponda:\n1. "tema": El nombre del tema de este post específico de forma clara y resumida.\n2. "titulo": Un título corto y llamativo en español (máximo 50 caracteres).\n3. "subtitulo": Un subtítulo explicativo de valor en español (máximo 85 caracteres).\n4. "mensaje": La frase corta/consejo tradicional en la voz folclórica del personaje (máximo 140 caracteres).\n5. "copy_facebook": El pie de foto detallado para Facebook en español (con emojis, CTA y hashtags autogenerados).\n6. "accion": Una acción física descriptiva en inglés (tercera persona) para ilustración limpia.\n7. "entorno": El entorno o fondo de la ilustración en inglés.\n\nDevuelve la información estructurada en JSON con este esquema exacto:\n{\n  "ideas": [\n    {\n      "tema": "Tema de la propuesta",\n      "titulo": "Título en español",\n      "subtitulo": "Subtítulo en español",\n      "mensaje": "Frase corta o pasos en español",\n      "copy_facebook": "Pie de foto para Facebook con emojis, llamado a la acción y hashtags autogenerados",\n      "accion": "Action in English",\n      "entorno": "Setting in English"\n    }\n  ]\n}';
}

/* ── Gemini API (direct fetch) ───────────────────────────────── */

const GEMINI_MODELS: Record<GeminiModel, string> = {
  "gemini-2.5-flash": "gemini-2.5-flash-preview-05-20",
  "gemini-2.5-pro": "gemini-2.5-pro-preview-05-06",
};

const IDEA_SCHEMA = {
  type: "OBJECT",
  properties: {
    tema: { type: "STRING" },
    titulo: { type: "STRING" },
    subtitulo: { type: "STRING" },
    mensaje: { type: "STRING" },
    copy_facebook: { type: "STRING" },
    accion: { type: "STRING" },
    entorno: { type: "STRING" },
  },
  required: ["tema", "titulo", "subtitulo", "mensaje", "copy_facebook", "accion", "entorno"],
};

async function callGemini(systemPrompt: string, userText: string, apiKey: string, model: GeminiModel, schema: object): Promise<string> {
  const modelName = GEMINI_MODELS[model] || GEMINI_MODELS["gemini-2.5-flash"];
  const url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

  const payload = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ parts: [{ text: userText }] }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    let friendlyMsg = "Error de Gemini API (HTTP " + res.status + ")";
    if (errBody.includes("FAILED_PRECONDITION") || errBody.includes("User location")) {
      friendlyMsg = "Restricción de región detectada. Activa una VPN (Estados Unidos o España) e inténtalo de nuevo.";
    } else if (res.status === 400 || res.status === 403) {
      friendlyMsg = "API Key inválida. Verifica que la copiaste completa desde Google AI Studio.";
    }
    throw new Error(friendlyMsg);
  }

  const data = await res.json();
  const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error("No se recibió respuesta válida de Gemini.");
  return text;
}

const GENERATE_SCHEMA = {
  type: "OBJECT",
  properties: { ideas: { type: "ARRAY", items: IDEA_SCHEMA } },
};

/* ── Z-AI SDK (built-in fallback) ───────────────────────────── */

async function callSDK(systemPrompt: string, userQuery: string): Promise<string> {
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages: [
      { role: "assistant", content: systemPrompt },
      { role: "user", content: userQuery },
    ],
    thinking: { type: "disabled" },
  });
  const text = completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content;
  if (!text) throw new Error("No se recibió respuesta válida del motor de IA integrado.");
  return text;
}

/* ── Public API ──────────────────────────────────────────────── */

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
  apiKey?: string;
  model?: GeminiModel;
}): Promise<CampaignIdea[]> {
  const {
    characterName,
    characterDesc,
    characterImgUrls,
    numMessages,
    photoStyle,
    facebookFooter,
    facebookHashtags,
    apiKey,
    model,
    ...promptParams
  } = params;

  const systemPrompt = buildSystemPrompt();
  const userQuery = buildUserPrompt({ characterName, characterDesc, numMessages, ...promptParams });

  let responseText: string;

  if (apiKey && apiKey.trim()) {
    responseText = await callGemini(systemPrompt, userQuery, apiKey, model || "gemini-2.5-flash", GENERATE_SCHEMA);
  } else {
    responseText = await callSDK(systemPrompt, userQuery);
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("La respuesta de la IA no contiene JSON válido.");

  const rawCampaignData = JSON.parse(jsonMatch[0]);
  const ideas: CampaignIdea[] = rawCampaignData.ideas || [];

  const styleDirective = PHOTO_STYLES[photoStyle] || PHOTO_STYLES.cinematic;

  const validImages = characterImgUrls.filter(function (u) { return u.trim().length > 0; });
  let imagePrefix = "";
  if (validImages.length === 1) imagePrefix = "Using this character reference image " + validImages[0] + " ";
  else if (validImages.length > 1) imagePrefix = "Using these character reference images " + validImages.join(", ") + " ";

  const processedIdeas = ideas.map(function (idea: CampaignIdea) {
    let copyFb = idea.copy_facebook || "";
    if (facebookFooter) copyFb += "\n\n" + facebookFooter;
    if (facebookHashtags) copyFb += "\n" + facebookHashtags;

    const actionText = idea.accion || "";
    const settingText = idea.entorno || "";
    const promptFlow = imagePrefix + "based on character description: " + characterDesc + ". Act as this character. The character is " + actionText + ". Setting: " + settingText + ". " + styleDirective;

    return {
      tema: idea.tema,
      titulo: idea.titulo,
      subtitulo: idea.subtitulo,
      mensaje: idea.mensaje,
      copy_facebook: copyFb,
      accion: idea.accion,
      entorno: idea.entorno,
      prompt_flow: promptFlow,
    };
  });

  return processedIdeas;
}

export async function refineSingleIdea(params: {
  idea: CampaignIdea;
  instructions: string;
  apiKey?: string;
  model?: GeminiModel;
}): Promise<CampaignIdea> {
  const { idea, instructions, apiKey, model } = params;

  const agentPrompt = 'Modifica la siguiente propuesta de contenido rural en base a estas instrucciones estrictas del usuario: "' + instructions + '".\nPropuesta actual:\n{\n  "tema": "' + idea.tema + '",\n  "titulo": "' + idea.titulo + '",\n  "subtitulo": "' + idea.subtitulo + '",\n  "mensaje": "' + idea.mensaje + '",\n  "copy_facebook": "' + (idea.copy_facebook || "").replace(/\n/g, "\\n") + '",\n  "accion": "' + (idea.accion || "") + '",\n  "entorno": "' + (idea.entorno || "") + '"\n}\n\nDevuelve obligatoriamente un JSON estricto únicamente con la propuesta corregida manteniendo las mismas claves:\n{\n  "tema": "Tema corregido si aplica",\n  "titulo": "Título corregido",\n  "subtitulo": "Subtítulo corregido",\n  "mensaje": "Mensaje corregido",\n  "copy_facebook": "Pie de foto corregido",\n  "accion": "Action in English",\n  "entorno": "Setting in English"\n}';

  const systemPrompt = "Eres un estratega de contenidos digitales y experto en agroecología. Modifica propuestas de contenido respetando el formato JSON.";

  let responseText: string;

  if (apiKey && apiKey.trim()) {
    responseText = await callGemini(systemPrompt, agentPrompt, apiKey, model || "gemini-2.5-flash", IDEA_SCHEMA);
  } else {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: agentPrompt },
      ],
      thinking: { type: "disabled" },
    });
    responseText = (completion.choices[0] && completion.choices[0].message && completion.choices[0].message.content) || "";
    if (!responseText) throw new Error("No se recibió respuesta válida al refinar.");
  }

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
        create: params.ideas.map(function (idea) {
          return {
            tema: idea.tema,
            titulo: idea.titulo,
            subtitulo: idea.subtitulo,
            mensaje: idea.mensaje,
            copyFacebook: idea.copy_facebook,
            accion: idea.accion,
            entorno: idea.entorno,
            promptFlow: idea.prompt_flow || "",
          };
        }),
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