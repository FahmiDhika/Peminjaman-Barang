import express from 'express';
import cors from 'cors';

// import router
import barangRouter from "./routers/barangRouter"
import userRouter from "./routers/userRouter"
import peminjamanRouter from "./routers/peminjamanRouter"

const PORT = 4000
const app = express()
app.use(cors())

app.use(`/api/inventory`, barangRouter)
app.use(`/api/user`, userRouter)
app.use(`/api/process`, peminjamanRouter)

app.listen(PORT, () => {
    console.log(`Server run on port http://localhost:${PORT}`)
})