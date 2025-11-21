// app/api/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export const runtime = "nodejs";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const categoryParam = searchParams.get("category");
  const limitParam = searchParams.get("limit") || "10";
  const limit = Math.min(Math.max(Number(limitParam) || 10, 1), 50);

  let categoryFilter: "CARDAPIO" | "COMBO_DIA" | "COMBO_TARDE" | undefined;

  if (categoryParam === "cardapio") categoryFilter = "CARDAPIO";
  if (categoryParam === "combo_dia") categoryFilter = "COMBO_DIA";
  if (categoryParam === "combo_tarde") categoryFilter = "COMBO_TARDE";

  try {
    let items = await db.getItems(categoryFilter);

    // Limit results
    items = items.slice(0, limit);

    // Map for compatibility
    const responseData = items.map((item) => ({
      ...item,
      image_path: item.image_url, // For backward compatibility
      public_url: item.image_url,
    }));

    return NextResponse.json(responseData, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (err) {
    console.error("Erro ao buscar media items:", err);
    return NextResponse.json(
      { message: "Erro ao buscar imagens." },
      { status: 500 }
    );
  }
}
