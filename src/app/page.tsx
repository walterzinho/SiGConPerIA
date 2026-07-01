"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaignStore } from "@/store/campaign-store";
import type {
  CharacterData,
  CampaignIdea,
  PhotoStyleType,
  EnfoqueType,
  CopyLengthType,
} from "@/types";
import { PHOTO_STYLES } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import {
  Plus,
  Trash2,
  Save,
  Copy,
  Download,
  ChevronDown,
  ChevronRight,
  Loader2,
  Sparkles,
  Check,
  RefreshCw,
  User,
  Settings,
  AlertCircle,
  FileText,
  History,
  ImageIcon,
  Radio as RadioIcon,
} from "lucide-react";

/* ── Constants ──────────────────────────────────────────────── */

const PHOTO_STYLE_LABELS: Record<PhotoStyleType, string> = {
  cinematic: "Cinematic Documentary (Default de alta calidad)",
  smartphone: "Smartphone Photo (Estilo captura orgánica/aficionado)",
  analog: "Vintage 35mm Analog Film (Textura nostálgica campesina)",
  watercolor:
    "Cozy Watercolor Painting (Ilustración tradicional pintada a mano)",
  oil: "Luminous Oil Canvas Painting (Pintura al óleo sobre lienzo)",
  macro: "Agricultural Studio Close-up (Fotografía macro e iluminación de studio)",
};

const ENFOQUE_OPTIONS: {
  value: EnfoqueType;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    value: "consejo",
    label: "Tipo Consejo",
    icon: "🟢",
    desc: "Contenido práctico y accesible, ideal para audiencias generales.",
  },
  {
    value: "tecnico",
    label: "Tipo Técnico",
    icon: "🔬",
    desc: "Profundidad científica y datos específicos del sector.",
  },
  {
    value: "tutorial",
    label: "Tipo Tutorial",
    icon: "📋",
    desc: "Paso a paso claro, orientado a instrucciones accionables.",
  },
];

const COPY_LENGTH_OPTIONS: { value: CopyLengthType; label: string }[] = [
  { value: "corto", label: "Corto" },
  { value: "medio", label: "Medio" },
  { value: "largo", label: "Largo" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" },
  }),
};

/* ── Component ──────────────────────────────────────────────── */

export default function HomePage() {
  const store = useCampaignStore();

  /* ── Local State ── */
  const [initialLoading, setInitialLoading] = useState(true);
  const [newCharDialogOpen, setNewCharDialogOpen] = useState(false);
  const [newCharSaving, setNewCharSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newImg1, setNewImg1] = useState("");
  const [newImg2, setNewImg2] = useState("");
  const [newImg3, setNewImg3] = useState("");

  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImg1, setEditImg1] = useState("");
  const [editImg2, setEditImg2] = useState("");
  const [editImg3, setEditImg3] = useState("");
  const [savingCharacter, setSavingCharacter] = useState(false);

  const [refiningIndex, setRefiningIndex] = useState<number | null>(null);
  const [refineTexts, setRefineTexts] = useState<Record<number, string>>({});
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(
    new Set()
  );

  /* ── Derived ── */
  const selectedChar = store.characters.find(
    (c) => c.id === store.selectedCharacterId
  );

  /* ── Initial Data Load ── */
  useEffect(() => {
    const load = async () => {
      try {
        await fetch("/api/seed", { method: "POST" });
        const [charsRes, histRes] = await Promise.all([
          fetch("/api/characters"),
          fetch("/api/history"),
        ]);
        const chars = await charsRes.json();
        const hist = await histRes.json();

        store.setCharacters(Array.isArray(chars) ? chars : []);
        store.setHistoryCount(hist.count ?? 0);

        if (Array.isArray(chars) && chars.length > 0) {
          store.selectCharacter(chars[0].id);
        }
      } catch {
        toast.error("Error al cargar datos iniciales");
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, [store]);

  /* ── Populate Edit Form When Character Changes ── */
  useEffect(() => {
    if (selectedChar) {
      setEditName(selectedChar.name);
      setEditDesc(selectedChar.description);
      setEditImg1(selectedChar.imgUrl1);
      setEditImg2(selectedChar.imgUrl2);
      setEditImg3(selectedChar.imgUrl3);
    }
  }, [selectedChar]);

  /* ── Handlers ── */

  const refreshCharacters = useCallback(async () => {
    try {
      const res = await fetch("/api/characters");
      const chars = await res.json();
      store.setCharacters(Array.isArray(chars) ? chars : []);
    } catch {
      /* silent */
    }
  }, [store]);

  const handleCreateCharacter = async () => {
    if (!newName.trim() || !newDesc.trim()) {
      toast.error("Nombre y descripción son obligatorios");
      return;
    }
    setNewCharSaving(true);
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim(),
          imgUrl1: newImg1.trim(),
          imgUrl2: newImg2.trim(),
          imgUrl3: newImg3.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al crear personaje");
      }
      const created = await res.json();
      await refreshCharacters();
      store.selectCharacter(created.id);
      setNewName("");
      setNewDesc("");
      setNewImg1("");
      setNewImg2("");
      setNewImg3("");
      setNewCharDialogOpen(false);
      toast.success(`Personaje "${created.name}" creado`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear personaje");
    } finally {
      setNewCharSaving(false);
    }
  };

  const handleSaveCharacter = async () => {
    if (!selectedChar) return;
    setSavingCharacter(true);
    try {
      const res = await fetch("/api/characters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedChar.id,
          name: editName.trim(),
          description: editDesc.trim(),
          imgUrl1: editImg1.trim(),
          imgUrl2: editImg2.trim(),
          imgUrl3: editImg3.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al guardar");
      }
      await refreshCharacters();
      toast.success("Personaje actualizado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar personaje");
    } finally {
      setSavingCharacter(false);
    }
  };

  const handleDeleteCharacter = async () => {
    if (!selectedChar) return;
    try {
      const res = await fetch(`/api/characters?id=${selectedChar.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      await refreshCharacters();
      if (store.characters.length > 0) {
        store.selectCharacter(store.characters[0].id);
      } else {
        store.selectCharacter("");
      }
      toast.success("Personaje eliminado");
    } catch {
      toast.error("Error al eliminar personaje");
    }
  };

  const handleGenerate = async () => {
    if (!selectedChar) {
      toast.error("Selecciona un personaje primero");
      return;
    }
    store.setIsGenerating(true);
    store.setGenerationError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: selectedChar.id,
          characterName: selectedChar.name,
          characterDesc: selectedChar.description,
          characterImgUrls: [
            selectedChar.imgUrl1,
            selectedChar.imgUrl2,
            selectedChar.imgUrl3,
          ].filter(Boolean),
          numMessages: store.numMessages,
          photoStyle: store.photoStyle,
          topics: store.topics,
          enfoque: store.enfoque,
          copyLength: store.copyLength,
          facebookFooter: store.facebookFooter,
          facebookHashtags: store.facebookHashtags,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error en la generación");
      }
      store.setCurrentCampaignId(data.campaignId);
      store.setCurrentIdeas(data.ideas);
      store.setCampaignMeta(data.meta);
      store.setHistoryCount((prev) => prev + 1);
      toast.success(
        `Campaña generada: ${data.ideas.length} propuestas creadas`
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      store.setGenerationError(msg);
      toast.error(msg);
    } finally {
      store.setIsGenerating(false);
    }
  };

  const handleRefine = async (index: number) => {
    const instructions = refineTexts[index]?.trim();
    if (!instructions) {
      toast.error("Escribe instrucciones para refinar");
      return;
    }
    const idea = store.currentIdeas[index];
    if (!idea) return;

    setRefiningIndex(index);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, instructions }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al refinar");
      }
      store.updateIdeaAtIndex(index, data);
      setRefineTexts((prev) => ({ ...prev, [index]: "" }));
      toast.success("Propuesta refinada");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Error al refinar la propuesta"
      );
    } finally {
      setRefiningIndex(null);
    }
  };

  const handleDownloadCSV = async (type: "active" | "history") => {
    try {
      const params =
        type === "active"
          ? `?type=active&campaignId=${store.currentCampaignId}`
          : "?type=history";
      const res = await fetch(`/api/export${params}`);
      if (!res.ok) throw new Error("Error al exportar");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        type === "active"
          ? `campana_${selectedChar?.name || "activa"}.csv`
          : "historial_completo.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CSV descargado exitosamente");
    } catch {
      toast.error("Error al descargar CSV");
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (!res.ok) throw new Error();
      store.setHistoryCount(0);
      toast.success("Historial limpiado");
    } catch {
      toast.error("Error al limpiar historial");
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado al portapapeles`);
    } catch {
      toast.error("No se pudo copiar al portapapeles");
    }
  };

  const togglePrompt = (index: number) => {
    setExpandedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  /* ── Render ── */

  if (initialLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-emerald-500" />
            <p className="text-sm text-zinc-400">Cargando SMC Pro...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── Header ── */}
      <header className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-emerald-600/20 flex items-center justify-center">
              <Sparkles className="size-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-50">
                  SMC Pro
                </h1>
                <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30 text-[10px]">
                  IA
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 hidden sm:block">
                Administrador de Campañas de Marketing con Personajes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            {selectedChar && (
              <Badge
                variant="outline"
                className="border-zinc-700 text-zinc-400 text-xs"
              >
                <User className="size-3 mr-1" />
                {selectedChar.name}
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <Tabs
          value={store.activeTab}
          onValueChange={(v) => store.setActiveTab(v as "character" | "campaign")}
        >
          <TabsList className="bg-zinc-900 border border-zinc-800/60">
            <TabsTrigger
              value="character"
              className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 gap-1.5"
            >
              <User className="size-4" />
              <span className="hidden sm:inline">👤 Personaje</span>
              <span className="sm:hidden">👤</span>
            </TabsTrigger>
            <TabsTrigger
              value="campaign"
              className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400 gap-1.5"
            >
              <Settings className="size-4" />
              <span className="hidden sm:inline">⚙️ Campaña</span>
              <span className="sm:hidden">⚙️</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Personaje ── */}
          <TabsContent value="character" className="space-y-4 mt-4">
            {/* Selector + Actions Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
              <div className="flex-1 w-full space-y-2">
                <Label className="text-zinc-400 text-sm">
                  Seleccionar Personaje
                </Label>
                <Select
                  value={store.selectedCharacterId || ""}
                  onValueChange={(v) => store.selectCharacter(v)}
                >
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Sin personajes disponibles" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    {store.characters.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Dialog
                  open={newCharDialogOpen}
                  onOpenChange={setNewCharDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                    >
                      <Plus className="size-4" />
                      <span className="hidden sm:inline">Nuevo</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-700 sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">
                        Crear Nuevo Personaje
                      </DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Define el nombre, rasgos físicos y URLs de referencia
                        visual.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">
                          Nombre Visual
                        </Label>
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Ej: Doña María del Campo"
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">
                          Descripción de Rasgos Físicos
                        </Label>
                        <Textarea
                          value={newDesc}
                          onChange={(e) => setNewDesc(e.target.value)}
                          placeholder="Describe su apariencia, edad aproximada, vestimenta, expresión..."
                          rows={4}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">
                          URL Referencia Visual 1
                        </Label>
                        <Input
                          value={newImg1}
                          onChange={(e) => setNewImg1(e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">
                          URL Referencia Visual 2
                        </Label>
                        <Input
                          value={newImg2}
                          onChange={(e) => setNewImg2(e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">
                          URL Referencia Visual 3
                        </Label>
                        <Input
                          value={newImg3}
                          onChange={(e) => setNewImg3(e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setNewCharDialogOpen(false)}
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateCharacter}
                        disabled={newCharSaving}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {newCharSaving ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}
                        Crear Personaje
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {selectedChar && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-zinc-700 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/30"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-zinc-100">
                          ¿Eliminar personaje?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          Se eliminará &quot;{selectedChar.name}&quot;
                          permanentemente. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteCharacter}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Character Editor */}
            {selectedChar && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-zinc-900/70 border-zinc-800/60 py-0 gap-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-zinc-200 text-base flex items-center gap-2">
                      <User className="size-4 text-emerald-400" />
                      Editor de Perfil Activo
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                      Modifica los datos del personaje seleccionado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0 pb-6">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-sm">
                        Nombre Visual
                      </Label>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-sm">
                        Descripción de Rasgos Físicos
                      </Label>
                      <Textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={4}
                        className="bg-zinc-800 border-zinc-700 text-zinc-100"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-sm">
                          Ref. Visual 1
                        </Label>
                        <Input
                          value={editImg1}
                          onChange={(e) => setEditImg1(e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-sm">
                          Ref. Visual 2
                        </Label>
                        <Input
                          value={editImg2}
                          onChange={(e) => setEditImg2(e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-400 text-sm">
                          Ref. Visual 3
                        </Label>
                        <Input
                          value={editImg3}
                          onChange={(e) => setEditImg3(e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSaveCharacter}
                      disabled={savingCharacter}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                      {savingCharacter ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Guardar Cambios del Personaje
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {!selectedChar && store.characters.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <User className="size-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No hay personajes creados aún.</p>
                <p className="text-xs mt-1">
                  Haz clic en &quot;➕ Nuevo&quot; para crear tu primer
                  personaje.
                </p>
              </div>
            )}
          </TabsContent>

          {/* ── Tab 2: Campaña ── */}
          <TabsContent value="campaign" className="space-y-5 mt-4">
            {/* Messages Count */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">
                Mensajes a Generar
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={store.numMessages}
                  onChange={(e) =>
                    store.setNumMessages(
                      Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-24 bg-zinc-900 border-zinc-800 text-zinc-100"
                />
                <span className="text-xs text-zinc-500">
                  Entre 1 y 20 mensajes
                </span>
              </div>
            </div>

            {/* Photo Style */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm flex items-center gap-1.5">
                <ImageIcon className="size-3.5" />
                Estilo Visual para Flow
              </Label>
              <Select
                value={store.photoStyle}
                onValueChange={(v) => store.setPhotoStyle(v as PhotoStyleType)}
              >
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {(
                    Object.entries(PHOTO_STYLE_LABELS) as [
                      PhotoStyleType,
                      string,
                    ][]
                  ).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">
                Temas o Enfoques a Repartir
              </Label>
              <Textarea
                value={store.topics}
                onChange={(e) => store.setTopics(e.target.value)}
                placeholder="Ej: cosecha de maíz, cuidado del ganado, mercados locales, recetas tradicionales..."
                rows={3}
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
              />
              <p className="text-xs text-zinc-600">
                Separa los temas con comas. La IA los distribuirá entre los
                mensajes.
              </p>
            </div>

            {/* Enfoque */}
            <div className="space-y-3">
              <Label className="text-zinc-400 text-sm">
                Profundidad del Contenido
              </Label>
              <RadioGroup
                value={store.enfoque}
                onValueChange={(v) => store.setEnfoque(v as EnfoqueType)}
                className="space-y-2"
              >
                {ENFOQUE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/50 p-3 cursor-pointer transition-colors hover:border-emerald-600/30 hover:bg-emerald-600/5 has-[[data-state=checked]]:border-emerald-600/40 has-[[data-state=checked]]:bg-emerald-600/5"
                  >
                    <RadioGroupItem
                      value={opt.value}
                      className="mt-0.5 data-[state=checked]:border-emerald-500 data-[state=checked]:text-emerald-500"
                    />
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                        <span>{opt.icon}</span>
                        {opt.label}
                      </div>
                      <p className="text-xs text-zinc-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Copy Length */}
            <div className="space-y-3">
              <Label className="text-zinc-400 text-sm">
                Extensión Copy de Facebook
              </Label>
              <RadioGroup
                value={store.copyLength}
                onValueChange={(v) => store.setCopyLength(v as CopyLengthType)}
                className="flex flex-wrap gap-2"
              >
                {COPY_LENGTH_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/50 px-4 py-2.5 cursor-pointer transition-colors hover:border-emerald-600/30 has-[[data-state=checked]]:border-emerald-600/40 has-[[data-state=checked]]:bg-emerald-600/10"
                  >
                    <RadioGroupItem
                      value={opt.value}
                      className="data-[state=checked]:border-emerald-500 data-[state=checked]:text-emerald-500"
                    />
                    <span className="text-sm text-zinc-300">{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Facebook Footer */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">
                Footer Fijo de Facebook
              </Label>
              <Input
                value={store.facebookFooter}
                onChange={(e) => store.setFacebookFooter(e.target.value)}
                placeholder="Ej: 🌾 Voces Campesinas — Cultivando futuro"
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
              />
            </div>

            {/* Facebook Hashtags */}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-sm">
                Hashtags Fijos Adicionales
              </Label>
              <Input
                value={store.facebookHashtags}
                onChange={(e) => store.setFacebookHashtags(e.target.value)}
                placeholder="Ej: #AgriculturaSostenible #VidaCampesina"
                className="bg-zinc-900 border-zinc-800 text-zinc-100"
              />
            </div>

            <Separator className="bg-zinc-800/60" />

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={store.isGenerating || !selectedChar}
              size="lg"
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold gap-2 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-600/20"
            >
              {store.isGenerating ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Generando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="size-5" />
                  ✨ Generar Campaña con IA
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* ── Results Section ── */}
        <section aria-label="Resultados de la campaña">
          {/* Welcome State */}
          {!store.isGenerating &&
            store.currentIdeas.length === 0 &&
            !store.generationError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-zinc-900/40 border-zinc-800/40 border-dashed">
                  <CardContent className="py-10 text-center">
                    <RadioIcon className="size-10 text-emerald-500/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-zinc-300 mb-2">
                      📻 ¡Todo Listo Para Empezar!
                    </h3>
                    <div className="max-w-md mx-auto space-y-2 text-sm text-zinc-500">
                      <p>
                        Configura tu personaje y parámetros de campaña, luego
                        presiona
                        <span className="text-emerald-400 font-medium">
                          {" "}
                          &quot;✨ Generar Campaña con IA&quot;
                        </span>{" "}
                        para crear contenido.
                      </p>
                      <Separator className="bg-zinc-800/40 my-3" />
                      <p>
                        Cada propuesta incluye un{" "}
                        <span className="text-zinc-400">
                          prompt para Flow
                        </span>{" "}
                        que puedes copiar para generar imágenes.
                      </p>
                      <p>
                        Exporta los resultados en{" "}
                        <span className="text-zinc-400">CSV</span> y
                        impórtalos directamente a{" "}
                        <span className="text-zinc-400">Notion</span> usando
                        separador de pipe (|).
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          {/* Loading State */}
          {store.isGenerating && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-zinc-900/70 border-zinc-800/60 py-0 gap-0">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 bg-zinc-800" />
                        <Skeleton className="h-5 w-16 bg-zinc-800" />
                      </div>
                      <Skeleton className="h-7 w-3/4 bg-zinc-800" />
                      <Skeleton className="h-5 w-1/2 bg-zinc-800" />
                      <Skeleton className="h-16 w-full bg-zinc-800" />
                      <Skeleton className="h-24 w-full bg-zinc-800" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              <p className="text-center text-sm text-zinc-500 animate-pulse">
                La IA está generando tus propuestas de campaña...
              </p>
            </div>
          )}

          {/* Error State */}
          {!store.isGenerating && store.generationError && (
            <Card className="border-red-500/30 bg-red-500/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="size-5 text-red-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-400 text-sm mb-1">
                      Error en la generación
                    </h3>
                    <p className="text-sm text-red-400/70">
                      {store.generationError}
                    </p>
                    <p className="text-xs text-zinc-600 mt-2">
                      Verifica que el personaje tenga datos válidos y que la
                      conexión al servicio de IA esté disponible. Intenta de
                      nuevo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campaign Cards Grid */}
          {!store.isGenerating && store.currentIdeas.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="size-4 text-emerald-500" />
                <span>
                  <span className="text-zinc-200 font-medium">
                    {store.currentIdeas.length}
                  </span>{" "}
                  propuestas generadas
                  {store.campaignMeta && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="text-emerald-400">
                        {store.campaignMeta.characterName}
                      </span>{" "}
                      · {store.campaignMeta.enfoque} ·{" "}
                      {store.campaignMeta.copyLength}
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {store.currentIdeas.map((idea, index) => (
                    <motion.div
                      key={`${store.currentCampaignId}-${index}`}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      layout
                    >
                      <Card className="bg-zinc-900/70 border-zinc-800/60 py-0 gap-0 relative overflow-hidden">
                        {/* Refining Overlay */}
                        {refiningIndex === index && (
                          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm z-20 flex items-center justify-center rounded-xl">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="size-6 animate-spin text-emerald-400" />
                              <span className="text-sm text-zinc-300">
                                Refinando propuesta...
                              </span>
                            </div>
                          </div>
                        )}

                        <CardContent className="p-4 sm:p-6 space-y-4">
                          {/* Badges Row */}
                          <div className="flex flex-wrap gap-1.5">
                            <Badge
                              variant="secondary"
                              className="bg-emerald-600/15 text-emerald-400 border-emerald-600/25 text-[11px]"
                            >
                              Propuesta {String(index + 1).padStart(2, "0")}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="border-zinc-700 text-zinc-400 text-[11px]"
                            >
                              {idea.tema}
                            </Badge>
                            {store.campaignMeta && (
                              <Badge
                                variant="outline"
                                className="border-zinc-700 text-zinc-400 text-[11px]"
                              >
                                {store.campaignMeta.characterName}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="border-amber-600/30 text-amber-400 text-[11px]"
                            >
                              🎨 Ilustración Limpia
                            </Badge>
                          </div>

                          {/* Flyer Título */}
                          <h3 className="text-xl sm:text-2xl font-bold text-zinc-50 leading-tight">
                            {idea.titulo}
                          </h3>

                          {/* Flyer Subtítulo */}
                          <p className="text-sm sm:text-base text-zinc-300 font-medium">
                            {idea.subtitulo}
                          </p>

                          <Separator className="bg-zinc-800/50" />

                          {/* Frase del Personaje */}
                          <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-3 sm:p-4">
                            <p className="text-xs text-amber-500/70 font-medium mb-1.5 uppercase tracking-wider">
                              Frase del Personaje
                            </p>
                            <p className="text-sm text-amber-200/90 italic leading-relaxed">
                              &ldquo;{idea.mensaje}&rdquo;
                            </p>
                          </div>

                          {/* Copy para Facebook */}
                          <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/40 p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                Copy para Facebook
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    idea.copy_facebook,
                                    "Copy"
                                  )
                                }
                                className="h-7 text-xs text-zinc-500 hover:text-emerald-400 hover:bg-emerald-600/10 px-2"
                              >
                                <Copy className="size-3.5 mr-1" />
                                copiar
                              </Button>
                            </div>
                            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                              {idea.copy_facebook}
                            </p>
                          </div>

                          {/* Prompt Flow (Collapsible) */}
                          {idea.prompt_flow && (
                            <Collapsible
                              open={expandedPrompts.has(index)}
                              onOpenChange={() => togglePrompt(index)}
                            >
                              <CollapsibleTrigger className="flex items-center gap-2 text-xs text-zinc-500 hover:text-emerald-400 transition-colors w-full py-1 group">
                                {expandedPrompts.has(index) ? (
                                  <ChevronDown className="size-3.5" />
                                ) : (
                                  <ChevronRight className="size-3.5" />
                                )}
                                <span className="group-hover:text-emerald-400">
                                  Prompt Flow
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(
                                      idea.prompt_flow!,
                                      "Prompt"
                                    );
                                  }}
                                  className="ml-auto h-6 text-xs text-zinc-600 hover:text-emerald-400 hover:bg-emerald-600/10 px-2"
                                >
                                  <Copy className="size-3 mr-1" />
                                  copiar
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-2 rounded-lg bg-zinc-950/80 border border-zinc-800/30 p-3">
                                  <p className="text-xs text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap break-words">
                                    {idea.prompt_flow}
                                  </p>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}

                          <Separator className="bg-zinc-800/40" />

                          {/* Modo Agente */}
                          <div className="space-y-2">
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                              🤖 Modo Agente — Refinar esta propuesta
                            </p>
                            <div className="flex gap-2">
                              <Input
                                value={refineTexts[index] || ""}
                                onChange={(e) =>
                                  setRefineTexts((prev) => ({
                                    ...prev,
                                    [index]: e.target.value,
                                  }))
                                }
                                placeholder="Ej: Haz el tono más cercano, acorta el título..."
                                className="flex-1 h-9 bg-zinc-800 border-zinc-700 text-zinc-200 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleRefine(index);
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRefine(index)}
                                disabled={
                                  refiningIndex === index ||
                                  !refineTexts[index]?.trim()
                                }
                                className="border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-300 h-9 shrink-0"
                              >
                                {refiningIndex === index ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="size-3.5" />
                                )}
                                <span className="hidden sm:inline ml-1.5">
                                  Aplicar
                                </span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </section>

        {/* ── Export Bar ── */}
        {store.currentIdeas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800/40 py-0 gap-0">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadCSV("active")}
                    className="border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/10 hover:text-emerald-300 gap-1.5"
                  >
                    <Download className="size-3.5" />
                    Campaña Activa (CSV)
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadCSV("history")}
                    className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 gap-1.5"
                  >
                    <FileText className="size-3.5" />
                    Registro Historial (CSV)
                  </Button>

                  <div className="sm:ml-auto flex items-center gap-2">
                    {store.historyCount > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 gap-1.5"
                          >
                            <History className="size-3.5" />
                            <Badge
                              variant="outline"
                              className="border-zinc-700 text-zinc-500 text-[10px]"
                            >
                              🗑️ {store.historyCount} guardados
                            </Badge>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-900 border-zinc-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-zinc-100">
                              ¿Limpiar todo el historial?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-zinc-400">
                              Se eliminarán permanentemente todos los registros
                              de campañas guardados. Esta acción no se puede
                              deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleClearHistory}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Limpiar Todo
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/40 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-center text-xs text-zinc-600">
            SMC Pro • Voces Campesinas — Gestor de Campañas con IA
          </p>
        </div>
      </footer>
    </main>
  );
}