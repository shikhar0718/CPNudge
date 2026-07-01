import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";


dotenv.config();

const app = express();


app.get("/",(req:Request , res:Response)=>{
    res.send("Backend is running")
})


const PORT = process.env.PORT
app.listen(PORT,()=>{
    console.log(`The server is running on: http://localhost:${PORT}`);

});

