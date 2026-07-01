import { create } from "zustand";
import type { CharacterData, CampaignIdea, EnfoqueType, CopyLengthType, PhotoStyleType } from "@/types";

export type GeminiModel = "gemini-2.5-flash" | "gemini-2.5-pro";

interface CampaignStore {
  // API Key & Model
  apiKey: string;
  model: GeminiModel;
  setApiKey: (k: string) => void;
  setModel: (m: GeminiModel) => void;
  get useGemini(): boolean;

  // Characters
  characters: CharacterData[];
  selectedCharacterId: string | null;
  editingCharacter: CharacterData | null;
  setCharacters: (chars: CharacterData[]) => void;
  selectCharacter: (id: string) => void;
  setEditingCharacter: (char: CharacterData | null) => void;

  // Campaign config
  numMessages: number;
  photoStyle: PhotoStyleType;
  topics: string;
  enfoque: EnfoqueType;
  copyLength: CopyLengthType;
  facebookFooter: string;
  facebookHashtags: string;
  setNumMessages: (n: number) => void;
  setPhotoStyle: (s: PhotoStyleType) => void;
  setTopics: (t: string) => void;
  setEnfoque: (e: EnfoqueType) => void;
  setCopyLength: (l: CopyLengthType) => void;
  setFacebookFooter: (f: string) => void;
  setFacebookHashtags: (h: string) => void;

  // Generation state
  isGenerating: boolean;
  generationError: string | null;
  currentCampaignId: string | null;
  currentIdeas: CampaignIdea[];
  campaignMeta: { characterName: string; enfoque: string; copyLength: string } | null;
  setIsGenerating: (v: boolean) => void;
  setGenerationError: (e: string | null) => void;
  setCurrentCampaignId: (id: string | null) => void;
  setCurrentIdeas: (ideas: CampaignIdea[]) => void;
  setCampaignMeta: (meta: { characterName: string; enfoque: string; copyLength: string } | null) => void;
  updateIdeaAtIndex: (index: number, idea: CampaignIdea) => void;

  // History
  historyCount: number;
  setHistoryCount: (n: number) => void;

  // UI
  activeTab: "character" | "campaign";
  setActiveTab: (tab: "character" | "campaign") => void;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  // API Key & Model
  apiKey: "",
  model: "gemini-2.5-flash",
  setApiKey: (k) => set({ apiKey: k }),
  setModel: (m) => set({ model: m }),
  get useGemini() {
    return get().apiKey.trim().length > 0;
  },

  // Characters
  characters: [],
  selectedCharacterId: null,
  editingCharacter: null,
  setCharacters: (chars) => set({ characters: chars }),
  selectCharacter: (id) => set({ selectedCharacterId: id }),
  setEditingCharacter: (char) => set({ editingCharacter: char }),

  // Campaign config
  numMessages: 8,
  photoStyle: "cinematic",
  topics: "",
  enfoque: "consejo",
  copyLength: "medio",
  facebookFooter: "",
  facebookHashtags: "",
  setNumMessages: (n) => set({ numMessages: n }),
  setPhotoStyle: (s) => set({ photoStyle: s }),
  setTopics: (t) => set({ topics: t }),
  setEnfoque: (e) => set({ enfoque: e }),
  setCopyLength: (l) => set({ copyLength: l }),
  setFacebookFooter: (f) => set({ facebookFooter: f }),
  setFacebookHashtags: (h) => set({ facebookHashtags: h }),

  // Generation
  isGenerating: false,
  generationError: null,
  currentCampaignId: null,
  currentIdeas: [],
  campaignMeta: null,
  setIsGenerating: (v) => set({ isGenerating: v }),
  setGenerationError: (e) => set({ generationError: e }),
  setCurrentCampaignId: (id) => set({ currentCampaignId: id }),
  setCurrentIdeas: (ideas) => set({ currentIdeas: ideas }),
  setCampaignMeta: (meta) => set({ campaignMeta: meta }),
  updateIdeaAtIndex: (index, idea) =>
    set((state) => {
      const updated = [...state.currentIdeas];
      updated[index] = idea;
      return { currentIdeas: updated };
    }),

  // History
  historyCount: 0,
  setHistoryCount: (n) => set({ historyCount: n }),

  // UI
  activeTab: "character",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));