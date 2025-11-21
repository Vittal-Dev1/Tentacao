// app/lib/db.ts
import { sql } from "@vercel/postgres";

export type MediaItem = {
    id: string;
    category: "CARDAPIO" | "COMBO_DIA" | "COMBO_TARDE";
    description?: string;
    image_url: string;
    created_at: string;
};

export const db = {
    async getItems(category?: string): Promise<MediaItem[]> {
        try {
            if (category) {
                const { rows } = await sql<MediaItem>`
          SELECT * FROM media_items 
          WHERE category = ${category}
          ORDER BY created_at DESC
        `;
                return rows;
            } else {
                const { rows } = await sql<MediaItem>`
          SELECT * FROM media_items 
          ORDER BY created_at DESC
        `;
                return rows;
            }
        } catch (error) {
            console.error("Error fetching items:", error);
            return [];
        }
    },

    async addItem(item: MediaItem): Promise<MediaItem> {
        const { rows } = await sql<MediaItem>`
      INSERT INTO media_items (id, category, description, image_url, created_at)
      VALUES (${item.id}, ${item.category}, ${item.description || null}, ${item.image_url}, ${item.created_at})
      RETURNING *
    `;
        return rows[0];
    },

    async deleteItem(id: string): Promise<void> {
        await sql`DELETE FROM media_items WHERE id = ${id}`;
    },

    async deleteItems(ids: string[]): Promise<void> {
        if (ids.length === 0) return;

        // Delete each item individually
        for (const id of ids) {
            await sql`DELETE FROM media_items WHERE id = ${id}`;
        }
    },

    async updateItem(
        id: string,
        updates: Partial<MediaItem>
    ): Promise<MediaItem | null> {
        const { description } = updates;

        const { rows } = await sql<MediaItem>`
      UPDATE media_items 
      SET description = ${description || null}
      WHERE id = ${id}
      RETURNING *
    `;

        return rows[0] || null;
    },

    async getItemById(id: string): Promise<MediaItem | null> {
        const { rows } = await sql<MediaItem>`
      SELECT * FROM media_items WHERE id = ${id}
    `;
        return rows[0] || null;
    },

    // Initialize database (create table if not exists)
    async init(): Promise<void> {
        try {
            await sql`
        CREATE TABLE IF NOT EXISTS media_items (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL CHECK (category IN ('CARDAPIO', 'COMBO_DIA', 'COMBO_TARDE')),
          description TEXT,
          image_url TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;

            await sql`
        CREATE INDEX IF NOT EXISTS idx_media_category ON media_items(category)
      `;

            await sql`
        CREATE INDEX IF NOT EXISTS idx_media_created_at ON media_items(created_at DESC)
      `;

            console.log("Database initialized successfully");
        } catch (error) {
            console.error("Error initializing database:", error);
        }
    },
};
