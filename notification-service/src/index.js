import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

import { app } from "./app.js";
import prisma from "./DB/index.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    
    console.log(`Server running on Port: ${PORT}`);
});