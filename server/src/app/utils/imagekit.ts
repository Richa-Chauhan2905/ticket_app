import ImageKit from "imagekit";
import { env } from "../../env.js";

export const imagekit = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
})

export async function uploadImage(file:Express.Multer.File) {
    const response = await imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: "/movies"
    })

    return response.url
}