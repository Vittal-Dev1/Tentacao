// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { db } from "@/app/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json(
        { message: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    if (!["CARDAPIO", "COMBO_DIA", "COMBO_TARDE"].includes(category)) {
      return NextResponse.json(
        { message: "Categoria inválida." },
        { status: 400 }
      );
    }

    // If uploading a new CARDAPIO, delete the old one first
    if (category === "CARDAPIO") {
      const existingCardapios = await db.getItems("CARDAPIO");

      if (existingCardapios.length > 0) {
        console.log(`Deletando ${existingCardapios.length} cardápio(s) antigo(s)...`);

        // Delete from Blob storage
        for (const item of existingCardapios) {
          try {
            const { del } = await import("@vercel/blob");
            await del(item.image_url);
          } catch (err) {
            console.error(`Erro ao deletar blob ${item.image_url}:`, err);
          }
        }

        // Delete from database
        const ids = existingCardapios.map((item) => item.id);
        await db.deleteItems(ids);
      }
    }

    // Generate unique filename
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${category.toLowerCase()}_${randomUUID()}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Save to database
    const newItem = await db.addItem({
      id: randomUUID(),
      category: category as "CARDAPIO" | "COMBO_DIA" | "COMBO_TARDE",
      description: description || undefined,
      image_url: blob.url,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Upload realizado com sucesso!",
      data: newItem,
    });
  } catch (err) {
    console.error("Erro geral no upload:", err);
    return NextResponse.json(
      { message: "Erro ao fazer upload da imagem." },
      { status: 500 }
    );
  }
}
