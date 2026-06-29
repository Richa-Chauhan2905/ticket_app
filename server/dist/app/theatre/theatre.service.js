import { db } from "../../db/index.js";
import { theatres } from "../../db/schema.js";
import { eq } from "drizzle-orm";
class TheatrService {
    async createThratre(data) {
        const [theatre] = await db
            .insert(theatres)
            .values({
            name: data.name,
            location: data.location,
        })
            .returning();
        return theatre;
    }
    async getAllTheatres() {
        return db.select().from(theatres);
    }
    async getTheatreById(id) {
        const result = await db.select().from(theatres).where(eq(theatres.id, id));
        return result[0] || null;
    }
}
export default TheatrService;
//# sourceMappingURL=theatre.service.js.map