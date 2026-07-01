import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const DEFAULT_CHARACTERS = [
  {
    name: "Don Evaristo",
    description: `Character: A 70-year-old Colombian farmer from the Cundiboyacense Plateau.
Features: Distinctive rural features, large, weathered hands with visible veins, a sparse, graying beard, 1.60 meters tall, dark complexion, a kind and cheerful face, and a wise and serene expression.
Clothing: A traditional Aguadas hat, a plaid shirt (earth tones), work pants, and well-fitting rubber boots. The shirt should be tucked into the pants.
Style: Realistic, highly detailed, documentary style, cinematic lighting, shallow depth of field, 50mm lens effect.`,
    imgUrl1: "https://labs.google/fx/tools/flow/shared/image/14289084-fa55-48e4-97bd-c9e4a3a336a0",
    imgUrl2: "https://labs.google/fx/tools/flow/shared/image/e8d099c3-66aa-489c-bea4-554471f4df4f",
    imgUrl3: "",
  },
  {
    name: "Mamá Justina",
    description: `Character: A sweet 68-year-old Colombian grandmother from the mountains.
Features: Kind smiling face, warm expressive eyes, silver hair tied in a neat traditional bun, short height, light tanned complexion.
Clothing: Colorful traditional embroidered apron over a simple modest floral dress, small gold earrings.
Style: Realistic, warm organic textures, documentary photography style, detailed wrinkles, cozy soft lighting.`,
    imgUrl1: "",
    imgUrl2: "",
    imgUrl3: "",
  },
  {
    name: "Camilo y Jenny",
    description: `Character: Camilo and Jenny, young Colombian tech-farmers, 22 years old.
Features: Energetic expressions, friendly smiles, proudly holding modern gadgets. Camilo has sun-kissed skin and Jenny has long dark braided hair.
Clothing: Comfortable rural work shirts, comfortable pants, boots. Camilo wears a modern baseball cap; Jenny wears a simple woven straw hat.
Style: Crisp documentary style, vibrant natural colors, shallow depth of field.`,
    imgUrl1: "",
    imgUrl2: "",
    imgUrl3: "",
  },
  {
    name: "Ernesto y Juli",
    description: `Character: Ernesto and Juli, conscious urban-rural couple, 32 years old.
Features: Intellectually curious and friendly, modern city-dwellers who appreciate rural life. Ernesto has stubble beard; Juli has a cheerful warm expression.
Clothing: Cozy modern clothing with subtle traditional Colombian accents (like a small ruana fabric detail).
Style: Contemporary realistic cinematic style, soft indoor ambient light, realistic detailed textures.`,
    imgUrl1: "",
    imgUrl2: "",
    imgUrl3: "",
  },
];

export async function POST() {
  try {
    const existing = await db.character.count();
    if (existing > 0) {
      return NextResponse.json({ message: "Los personajes base ya existen", seeded: false });
    }

    for (const char of DEFAULT_CHARACTERS) {
      await db.character.create({ data: char });
    }

    const total = await db.character.count();
    return NextResponse.json({ message: `${total} personajes creados`, seeded: true });
  } catch {
    return NextResponse.json({ error: "Error al sembrar personajes" }, { status: 500 });
  }
}