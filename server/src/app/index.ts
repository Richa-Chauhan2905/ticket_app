import express from 'express'
import type {Express} from 'express'
import { theatreRouter } from './theatre/theatre.route.js'
import { authRouter } from './auth/auth.route.js'
import { authenticationMiddleware } from './middleware/auth.middleware.js'

export function createApplication(): Express {
    const app = express()

    app.use(express.json())

    app.get('/', (req, res) => {
        return res.json({ message: "Welcome to TicketBooking "})
    })
    app.use(authenticationMiddleware())
    app.use("/auth", authRouter)
    app.use("/theatre", theatreRouter);


    return app
}