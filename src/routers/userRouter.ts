import express from "express";

// import controller & middlewares
import { newUser, updateUser, deleteUser, authentication, getAllUser } from "../controllers/userController";
import { verifyAuthentication, verifyAddUser, verifyEditUser } from "../middlewares/verifyUser";
import { verifyToken, verifyRole } from "../middlewares/authorization";

const app = express();
app.use(express.json());

app.get(`/get`, [verifyToken, verifyRole(["ADMIN"])], getAllUser)
app.post(`/new`, [verifyAddUser],newUser)
app.post(`/login`, verifyAuthentication, authentication)
app.put(`/update/:id`, [verifyEditUser], updateUser)
app.delete(`/delete/:id`,[verifyToken, verifyRole(["ADMIN"])], deleteUser)

export default app;