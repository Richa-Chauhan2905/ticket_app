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
        const [adminUser] = await db.insert(users).values({
            name: "Admin User",
            email: "admin@ticketapp.com",
            password: adminPassword,
            role: "admin",
            isVerified: true
        }).returning();
        const [normalUser] = await db.insert(users).values({
            name: "John Doe",
            email: "user@ticketapp.com",
            password: userPassword,
            role: "user",
            isVerified: true
        }).returning();
        console.log(`Created users: \n- Admin: ${adminUser.email} (Admin@123)\n- User: ${normalUser.email} (User@123)`);
        // 2. Create Movies
        const moviesData = [
            {
                title: "Inception",
                description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                duration: 148,
                language: "English",
                posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=80"
            },
            {
                title: "Interstellar",
                description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                duration: 169,
                language: "English",
                posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80"
            },
            {
                title: "The Dark Knight",
                description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                duration: 152,
                language: "English",
                posterUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop&q=80"
            },
            {
                title: "Spirited Away",
                description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
                duration: 125,
                language: "Japanese",
                posterUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80"
            },
            {
                title: "Spider-Man: Into the Spider-Verse",
                description: "Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.",
                duration: 117,
                language: "English",
                posterUrl: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80"
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
        const [pvrS1] = await db.insert(screens).values({
            theatreId: insertedTheatres[0].id,
            name: "Screen 1",
            totalSeats: 30
        }).returning();
        const [pvrS2] = await db.insert(screens).values({
            theatreId: insertedTheatres[0].id,
            name: "IMAX Screen",
            totalSeats: 40
        }).returning();
        // INOX gets Screen 1
        const [inoxS1] = await db.insert(screens).values({
            theatreId: insertedTheatres[1].id,
            name: "Screen 1",
            totalSeats: 25
        }).returning();
        // Cinepolis gets VIP Lounge
        const [cineS1] = await db.insert(screens).values({
            theatreId: insertedTheatres[2].id,
            name: "VIP Lounge",
            totalSeats: 20
        }).returning();
        console.log("Inserted screens for theatres.");
        // 5. Create Shows (using ShowService so seats are populated automatically)
        // Let's create shows spread over today, tomorrow, and day after tomorrow
        const baseDate = new Date();
        baseDate.setHours(10, 0, 0, 0); // Start at 10:00 AM
        const showsToCreate = [
            // Inception shows
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
            // Interstellar shows
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
            // The Dark Knight shows
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
            // Spirited Away shows
            {
                movieId: insertedMovies[3].id,
                screenId: cineS1.id,
                startTime: new Date(baseDate.getTime() + 5 * 60 * 60 * 1000).toISOString(), // +5h
                price: 350
            },
            // Spider-Man shows
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