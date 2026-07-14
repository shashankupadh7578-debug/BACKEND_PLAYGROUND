import express from "express";
import cookieParsor from "cookie-parser"
import userrouter from "./routes/user.routes.js";
import blogrouter from "./routes/blog.routes.js";
const app =  express();

app.use(express.json())
app.use(cookieParsor())
app.get("/",(req,res)=>{
    res.send("health check")
})

app.use("/user",userrouter)
app.use("/blog",blogrouter)

export default app