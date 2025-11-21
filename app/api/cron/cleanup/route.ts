// app/api/cron/cleanup/route.ts
import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/app/lib/db";

export const runtime = "nodejs";

export async function GET() {
    try {
        // Fetch all COMBO_DIA and COMBO_TARDE items
        const comboDiaItems = await db.getItems("COMBO_DIA");
        const comboTardeItems = await db.getItems("COMBO_TARDE");

        const allComboItems = [...comboDiaItems, ...comboTardeItems];

        if (allComboItems.length === 0) {
            return NextResponse.json({
                message: "Nenhum combo para deletar.",
                deleted: 0,
            });
        }

        console.log(`Deletando ${allComboItems.length} combos...`);

        // Delete from filesystem
        for (const item of allComboItems) {
            try {
                const relativePath = item.image_url.startsWith("/")
                    ? item.image_url.slice(1)
                    : item.image_url;

                const filePath = path.join(process.cwd(), "public", relativePath);
                await unlink(filePath);
            } catch (err) {
                console.error(`Erro ao deletar arquivo ${item.image_url}:`, err);
                // Continue even if file deletion fails
            }
        }

        // Delete from database
        const ids = allComboItems.map((item) => item.id);
        await db.deleteItems(ids);

        return NextResponse.json({
            message: `${allComboItems.length} combo(s) deletado(s) com sucesso.`,
            deleted: allComboItems.length,
        });
    } catch (err) {
        console.error("Erro ao limpar combos:", err);
        return NextResponse.json(
            { message: "Erro ao limpar combos." },
            { status: 500 }
        );
    }
}
