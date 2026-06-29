import 'dotenv/config';
import { db } from "./index.js";
import { movies, theatres, screens, shows, seats, users, bookings, bookingSeats, payments } from "./schema.js";
import ShowService from "../app/shows/show.services.js";
import bcrypt from "bcryptjs";
const showService = new ShowService();
async function seed() {
    try {
        console.log("Starting database clean up...");
        // Delete in reverse order of foreign keys
        await db.delete(payments);
        await db.delete(bookingSeats);
        await db.delete(bookings);
        await db.delete(seats);
        await db.delete(shows);
        await db.delete(screens);
        await db.delete(theatres);
        await db.delete(movies);
        await db.delete(users);
        console.log("Clean up finished. Inserting seed data...");
        // 1. Create Users (Admin & User)
        const adminPassword = await bcrypt.hash("Admin@123", 10);
        const userPassword = await bcrypt.hash("User@123", 10);
        const adminUserRes = await db.insert(users).values({
            name: "Admin User",
            email: "admin@ticketapp.com",
            password: adminPassword,
            role: "admin",
            isVerified: true
        }).returning();
        const adminUser = adminUserRes[0];
        const normalUserRes = await db.insert(users).values({
            name: "John Doe",
            email: "user@ticketapp.com",
            password: userPassword,
            role: "user",
            isVerified: true
        }).returning();
        const normalUser = normalUserRes[0];
        console.log(`Created users: \n- Admin: ${adminUser.email} (Admin@123)\n- User: ${normalUser.email} (User@123)`);
        // 2. Create Movies (Bollywood movies with Wikipedia poster URLs)
        const moviesData = [
            {
                title: "3 Idiots",
                description: "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently, even as the rest of the world called them idiots.",
                duration: 170,
                language: "Hindi",
                posterUrl: "https://upload.wikimedia.org/wikipedia/en/d/df/3_idiots_poster.jpg"
            },
            {
                title: "Zindagi Na Milegi Dobara",
                description: "Three friends decide to turn their fantasy vacation into reality after one of them gets engaged.",
                duration: 155,
                language: "Hindi",
                posterUrl: "https://upload.wikimedia.org/wikipedia/en/3/3d/Zindagi_Na_Milegi_Dobara_poster.jpg"
            },
            {
                title: "Dangal",
                description: "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.",
                duration: 161,
                language: "Hindi",
                posterUrl: "https://upload.wikimedia.org/wikipedia/en/9/99/Dangal_Poster.jpg"
            },
            {
                title: "Sholay",
                description: "After his family is murdered by a notorious bandit, a former police officer hires two outlaws to capture him.",
                duration: 204,
                language: "Hindi",
                posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/52/Sholay-poster.jpg"
            },
            {
                title: "Dilwale Dulhania Le Jayenge",
                description: "When Raj meets Simran in Europe, it isn't love at first sight but when Simran moves to India for an arranged marriage, love finds its way.",
                duration: 189,
                language: "Hindi",
                posterUrl: "https://upload.wikimedia.org/wikipedia/en/8/80/Dilwale_Dulhania_Le_Jayenge_poster.jpg"
            }
        ];
        const insertedMovies = [];
        for (const movie of moviesData) {
            const [m] = await db.insert(movies).values(movie).returning();
            insertedMovies.push(m);
        }
        console.log(`Inserted ${insertedMovies.length} movies.`);
        // 3. Create Theatres
        const theatresData = [
            { name: "PVR Directors Cut", location: "Select CityWalk, Delhi" },
            { name: "INOX Megaplex", location: "Nariman Point, Mumbai" },
            { name: "Cinepolis VIP", location: "Forum Mall, Bangalore" }
        ];
        const insertedTheatres = [];
        for (const theatre of theatresData) {
            const [t] = await db.insert(theatres).values(theatre).returning();
            insertedTheatres.push(t);
        }
        console.log(`Inserted ${insertedTheatres.length} theatres.`);
        // 4. Create Screens
        // PVR gets Screen 1 and IMAX Screen
        const pvrS1Res = await db.insert(screens).values({
            theatreId: insertedTheatres[0].id,
            name: "Screen 1",
            totalSeats: 30
        }).returning();
        const pvrS1 = pvrS1Res[0];
        const pvrS2Res = await db.insert(screens).values({
            theatreId: insertedTheatres[0].id,
            name: "IMAX Screen",
            totalSeats: 40
        }).returning();
        const pvrS2 = pvrS2Res[0];
        // INOX gets Screen 1
        const inoxS1Res = await db.insert(screens).values({
            theatreId: insertedTheatres[1].id,
            name: "Screen 1",
            totalSeats: 25
        }).returning();
        const inoxS1 = inoxS1Res[0];
        // Cinepolis gets VIP Lounge
        const cineS1Res = await db.insert(screens).values({
            theatreId: insertedTheatres[2].id,
            name: "VIP Lounge",
            totalSeats: 20
        }).returning();
        const cineS1 = cineS1Res[0];
        console.log("Inserted screens for theatres.");
        // 5. Create Shows (using ShowService so seats are populated automatically)
        const baseDate = new Date();
        baseDate.setHours(10, 0, 0, 0); // Start at 10:00 AM
        const showsToCreate = [
            // 3 Idiots shows
            {
                movieId: insertedMovies[0].id,
                screenId: pvrS1.id,
                startTime: new Date(baseDate.getTime() + 4 * 60 * 60 * 1000).toISOString(), // +4h
                price: 250
            },
            {
                movieId: insertedMovies[0].id,
                screenId: inoxS1.id,
                startTime: new Date(baseDate.getTime() + 8 * 60 * 60 * 1000).toISOString(), // +8h
                price: 300
            },
            // ZNMD shows
            {
                movieId: insertedMovies[1].id,
                screenId: pvrS2.id,
                startTime: new Date(baseDate.getTime() + 6 * 60 * 60 * 1000).toISOString(), // +6h
                price: 450
            },
            {
                movieId: insertedMovies[1].id,
                screenId: cineS1.id,
                startTime: new Date(baseDate.getTime() + 32 * 60 * 60 * 1000).toISOString(), // Tomorrow +8h
                price: 550
            },
            // Dangal shows
            {
                movieId: insertedMovies[2].id,
                screenId: pvrS2.id,
                startTime: new Date(baseDate.getTime() + 10 * 60 * 60 * 1000).toISOString(), // +10h
                price: 400
            },
            {
                movieId: insertedMovies[2].id,
                screenId: inoxS1.id,
                startTime: new Date(baseDate.getTime() + 30 * 60 * 60 * 1000).toISOString(), // Tomorrow +6h
                price: 300
            },
            // Sholay shows
            {
                movieId: insertedMovies[3].id,
                screenId: cineS1.id,
                startTime: new Date(baseDate.getTime() + 5 * 60 * 60 * 1000).toISOString(), // +5h
                price: 350
            },
            // DDLJ shows
            {
                movieId: insertedMovies[4].id,
                screenId: pvrS1.id,
                startTime: new Date(baseDate.getTime() + 28 * 60 * 60 * 1000).toISOString(), // Tomorrow +4h
                price: 250
            }
        ];
        console.log("Creating shows and generating seats...");
        for (const showData of showsToCreate) {
            await showService.createShow(showData);
        }
        console.log("Seeding complete! Database is fully populated.");
        process.exit(0);
    }
    catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map