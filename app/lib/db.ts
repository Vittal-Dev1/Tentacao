// app/lib/db.ts
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export type MediaItem = {
    id: string;
    category: "CARDAPIO" | "COMBO_DIA" | "COMBO_TARDE";
    description?: string;
    image_url: string;
    created_at: string;
};

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

// Ensure db file exists
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

// Helper to read and normalize DB data
function readDb(): MediaItem[] {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return [];
        }
        const data = fs.readFileSync(DB_PATH, "utf-8");
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
            return parsed;
        }

        // Handle legacy format { items: [] }
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.items)) {
            return parsed.items;
        }

        return [];
    } catch (error) {
        console.error("Error reading DB:", error);
        return [];
    }
}

export const db = {
    async getItems(category?: string): Promise<MediaItem[]> {
        const items = readDb();

        let filtered = items;
        if (category) {
            filtered = items.filter((item) => item.category === category);
        }

        // Sort by created_at DESC
        return filtered.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    },

    async addItem(item: MediaItem): Promise<MediaItem> {
        const items = readDb();

        items.push(item);
        fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2));

        return item;
    },

    async deleteItem(id: string): Promise<void> {
        let items = readDb();

        items = items.filter((item) => item.id !== id);
        fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2));
    },

    async deleteItems(ids: string[]): Promise<void> {
        let items = readDb();

        items = items.filter((item) => !ids.includes(item.id));
        fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2));
    },

    async updateItem(
        id: string,
        updates: Partial<MediaItem>
    ): Promise<MediaItem | null> {
        const items = readDb();

        const index = items.findIndex((item) => item.id === id);
        if (index === -1) return null;

        items[index] = { ...items[index], ...updates };
        fs.writeFileSync(DB_PATH, JSON.stringify(items, null, 2));

        return items[index];
    },

    async getItemById(id: string): Promise<MediaItem | null> {
        const items = readDb();

        return items.find((item) => item.id === id) || null;
    },

    // Mock init for compatibility
    async init(): Promise<void> {
        return Promise.resolve();
    }
};
