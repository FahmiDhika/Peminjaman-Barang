import express from "express";
import { getAllPeminjaman, pengembalianBarang, pinjamBarang, laporanPenggunaan, analisisBarang } from "../controllers/peminjamanController";
import { verifyToken, verifyRole } from "../middlewares/authorization";
import { verifyPeminjaman, laporanPenggunaanMiddlewares, analisisPenggunaanMiddlewares } from "../middlewares/pinjamValidation";

// import controller & middlewares

const app = express();
app.use(express.json());

app.get(`/get`, [verifyToken, verifyRole(["ADMIN"])], getAllPeminjaman)
app.post(`/peminjaman`, [verifyToken, verifyRole(["USER"]), verifyPeminjaman], pinjamBarang)
app.post(`/pengembalian`, [verifyToken, verifyRole(["USER"])], pengembalianBarang)
app.post(`/laporan`, [verifyToken, verifyRole(["ADMIN"]), laporanPenggunaanMiddlewares], laporanPenggunaan)
app.post(`/analisis`, [verifyToken, verifyRole(["ADMIN"]), analisisPenggunaanMiddlewares], analisisBarang)

export default app;