// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
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

        // Delete from filesystem
        for (const item of existingCardapios) {
          try {
            // Extract filename from URL/path
            // Assuming image_url is like /uploads/cardapio/filename.jpg
            const relativePath = item.image_url.startsWith("/")
              ? item.image_url.slice(1)
              : item.image_url;

            const filePath = path.join(process.cwd(), "public", relativePath);
            await unlink(filePath);
          } catch (err) {
            console.error(`Erro ao deletar arquivo ${item.image_url}:`, err);
          }
        }

        // Delete from database
        const ids = existingCardapios.map((item) => item.id);
        await db.deleteItems(ids);
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${category.toLowerCase()}_${randomUUID()}.${fileExtension}`;

    // Determine folder based on category
    let folder = "uploads";
    if (category === "CARDAPIO") folder = "uploads/cardapio";
    else if (category === "COMBO_DIA") folder = "uploads/combo_dia";
    else if (category === "COMBO_TARDE") folder = "uploads/combo_tarde";

    // Ensure directory exists (handled by fs.mkdir in a real app, but here we assume structure or create it)
    const uploadDir = path.join(process.cwd(), "public", folder);
    const fs = require("fs");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicPath = `/${folder}/${fileName}`;

    const newItem = await db.addItem({
      id: randomUUID(),
      category: category as "CARDAPIO" | "COMBO_DIA" | "COMBO_TARDE",
      description: description || undefined,
      image_url: publicPath,
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
