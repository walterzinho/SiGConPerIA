import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const characters = await db.character.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(characters);
  } catch {
    return NextResponse.json({ error: "Error al obtener personajes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, imgUrl1, imgUrl2, imgUrl3 } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "Nombre y descripción son obligatorios" }, { status: 400 });
    }

    const character = await db.character.create({
      data: {
        name,
        description,
        imgUrl1: imgUrl1 || "",
        imgUrl2: imgUrl2 || "",
        imgUrl3: imgUrl3 || "",
      },
    });

    return NextResponse.json(character, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al crear personaje" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, description, imgUrl1, imgUrl2, imgUrl3 } = body;

    if (!id) {
      return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 });
    }

    const character = await db.character.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(imgUrl1 !== undefined && { imgUrl1 }),
        ...(imgUrl2 !== undefined && { imgUrl2 }),
        ...(imgUrl3 !== undefined && { imgUrl3 }),
      },
    });

    return NextResponse.json(character);
  } catch {
    return NextResponse.json({ error: "Error al actualizar personaje" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 });
    }

    await db.character.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar personaje" }, { status: 500 });
  }
}