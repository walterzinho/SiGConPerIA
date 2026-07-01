export interface CampaignIdea {
  tema: string;
  titulo: string;
  subtitulo: string;
  mensaje: string;
  copy_facebook: string;
  accion: string;
  entorno: string;
  prompt_flow?: string;
}

export interface CharacterData {
  id: string;
  name: string;
  description: string;
  imgUrl1: string;
  imgUrl2: string;
  imgUrl3: string;
}

export interface CampaignData {
  id: string;
  characterId: string;
  characterName: string;
  characterDesc: string;
  enfoque: string;
  photoStyle: string;
  copyLength: string;
  facebookFooter: string;
  facebookHashtags: string;
  createdAt: string;
  items: CampaignIdea[];
}

export type EnfoqueType = "consejo" | "tecnico" | "tutorial";
export type CopyLengthType = "corto" | "medio" | "largo";
export type PhotoStyleType = "cinematic" | "smartphone" | "analog" | "watercolor" | "oil" | "macro";

export const PHOTO_STYLES: Record<PhotoStyleType, string> = {
  cinematic: "Style: Realistic, highly detailed, cinematic lighting, shallow depth of field, 50mm lens effect, professional composition, 2K.",
  smartphone: "Style: Raw, unedited smartphone photo taken by an amateur, slight motion blur, casual lighting, realistic organic skin textures, real-world farm context.",
  analog: "Style: Vintage 35mm analog film photograph, warm classic color grading, subtle film grain, nostalgic feel, realistic shadows, authentic farm atmosphere.",
  watercolor: "Style: Cozy warm watercolor painting, soft hand-drawn illustrations, pastel color tones, traditional artistic sketch feel, beautiful rural concept art.",
  oil: "Style: Luminous oil canvas painting, rich impasto brush strokes, classical fine art style, dramatic chiaroscuro lighting, textured canvas representation.",
  macro: "Style: Professional agricultural macro studio photography, high-end close-up, sharp focus on details, pristine studio lighting, shallow depth of field."
};