// app/api/media/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/app/lib/db";

export const runtime = "nodejs";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get item to find blob URL
        const item = await db.getItemById(id);

        if (!item) {
            return NextResponse.json(
                { message: "Item não encontrado." },
                { status: 404 }
            );
        }

        // Delete from Blob storage
        try {
            await del(item.image_url);
        } catch (err) {
            console.error("Erro ao deletar blob:", err);
            // Continue even if blob deletion fails
        }

        // Delete from database
        await db.deleteItem(id);

        return NextResponse.json({ message: "Item deletado com sucesso." });
    } catch (err) {
        console.error("Erro ao deletar item:", err);
        return NextResponse.json(
            { message: "Erro ao deletar item." },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        console.log(`PATCH request for id: ${id}`, body);

        const { description } = body;

        if (typeof description !== "string") {
            console.log("Invalid description type:", typeof description);
            return NextResponse.json(
                { message: "Descrição inválida." },
                { status: 400 }
            );
        }

        const updated = await db.updateItem(id, { description });
        console.log("Updated item:", updated);

        if (!updated) {
            return NextResponse.json(
                { message: "Item não encontrado." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Item atualizado com sucesso.",
            data: updated,
        });
    } catch (err) {
        console.error("Erro ao atualizar item:", err);
        return NextResponse.json(
            { message: "Erro ao atualizar item." },
            { status: 500 }
        );
    }
}
