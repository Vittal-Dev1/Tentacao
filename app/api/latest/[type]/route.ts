// app/api/latest/[type]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export const runtime = "nodejs";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ type: string }> }
) {
    const { type } = await params;

    let category: "CARDAPIO" | "COMBO_DIA" | "COMBO_TARDE" | undefined;

    switch (type.toLowerCase()) {
        case "cardapio":
            category = "CARDAPIO";
            break;
        case "dia":
            category = "COMBO_DIA";
            break;
        case "tarde":
            category = "COMBO_TARDE";
            break;
        default:
            return NextResponse.json(
                { message: "Tipo inválido. Use: cardapio, dia, ou tarde." },
                { status: 400 }
            );
    }

    try {
        const items = await db.getItems(category);

        if (!items || items.length === 0) {
            return NextResponse.json(
                { message: "Nenhuma imagem encontrada para esta categoria." },
                { status: 404 }
            );
        }

        // Items are already sorted by created_at DESC from db.getItems
        const latestItem = items[0];

        // Redirect to the image URL
        const imageUrl = latestItem.image_url.startsWith("http")
            ? latestItem.image_url
            : `${req.nextUrl.origin}${latestItem.image_url}`;

        return NextResponse.redirect(imageUrl);
    } catch (err) {
        console.error("Erro ao buscar imagem recente:", err);
        return NextResponse.json(
            { message: "Erro interno." },
            { status: 500 }
        );
    }
}
