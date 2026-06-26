import { db } from "../../db/index.js";
import { screens } from "../../db/schema.js";
import { eq } from "drizzle-orm";

type CreateScreenData = {
  theatreId: string;
  name: string;
  totalSeats: number;
};

class ScreenService {
  async createScreen(data: CreateScreenData) {
    const [screen] = await db
      .insert(screens)
      .values({
        theatreId: data.theatreId,
        name: data.name,
        totalSeats: data.totalSeats,
      })
      .returning();

    return screen;
  }

  async getScreensByTheatre(theatreId: string) {
    return db.select().from(screens).where(eq(screens.theatreId, theatreId));
  }
}

export default ScreenService;
