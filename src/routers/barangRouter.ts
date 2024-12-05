import express from "express";

// import controller & middlewares
import { deleteBarang, getAllBarang, getBarang, newBarang, updateBarang } from "../controllers/barangController";
import { verifyAddBarang, verifyEditBarang } from "../middlewares/verifyBarang";
import { verifyToken, verifyRole } from "../middlewares/authorization";

const app = express();
app.use(express.json());

app.get(`/get/:id`, [verifyToken, verifyRole([`ADMIN`, `USER`])], getBarang)
app.get(`/getAll`, [verifyToken, verifyRole([`ADMIN`, `USER`])], getAllBarang)
app.post(`/new`, [verifyToken, verifyRole([`ADMIN`]), verifyAddBarang], newBarang)
app.put(`/update/:id`, [verifyToken, verifyRole([`ADMIN`]), verifyEditBarang], updateBarang)
app.delete(`/delete/:id`, [verifyToken, verifyRole([`ADMIN`])], deleteBarang)

export default app;
