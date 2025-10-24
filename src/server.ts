// src/server.ts

import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import router from "./routes";
import path from "path";

const app = express();

app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: true }));

app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Konfigurasi CORS
const corsOptions = {
  origin: "*", // Mengizinkan semua origin
};

app.use(cors(corsOptions));

app.use("/", router);

// Kalo halaman gak ditemuin
app.get("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Halaman tidak ditemukan. Silakan periksa URL Anda.",
  });
});

app.use(errorHandler);

// Menangani uncaughtException
process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception:", err);
});

// Menangani unhandledRejection
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  console.error("Unhandled Rejection:", reason);
});

// Start server di port 3000
const PORT: number = 3001;
app.listen(PORT, () => {
  console.log(`Server Running On Port : ${PORT}`);
});
