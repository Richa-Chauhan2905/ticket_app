import { createServer } from "node:http";
import { createApplication } from "./app/app.js";

async function main() {
  try {
    const app = createApplication();
    const server = createServer(app);
    const PORT: number = 8080;

    server.listen(PORT, () => {
      console.log(`HTTP server running on port ${ PORT}`);
    });
  } catch (error) {
    console.log("An error occured: ", error);
  }
}

main();
