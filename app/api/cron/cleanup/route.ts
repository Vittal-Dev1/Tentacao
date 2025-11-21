// app/api/cron/cleanup/route.ts
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
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

        // Delete from Blob storage
        for (const item of allComboItems) {
            try {
                await del(item.image_url);
            } catch (err) {
                console.error(`Erro ao deletar blob ${item.image_url}:`, err);
                // Continue even if blob deletion fails
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
