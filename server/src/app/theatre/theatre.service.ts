import { db } from "../../db/index.js";
import { theatres } from "../../db/schema.js";
import { eq } from "drizzle-orm";

type createTheatreData = {
  name: string;
  location: string;
};

class TheatrService {
  async createThratre(data: createTheatreData) {
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

  async getTheatreById(id: string) {
    const result = await db.select().from(theatres).where(eq(theatres.id, id));

    return result[0] || null;
  }
}

export default TheatrService;
