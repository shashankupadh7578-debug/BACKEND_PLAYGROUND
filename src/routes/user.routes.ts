import express from "express"
import { verifyjwt } from "../middlewares/verifyjwt.js"
import { login_controller,register_controller,logout, update, changePassword } from "../controllers/user.controller.js"

const userrouter = express.Router()

userrouter.post("/register",register_controller)
userrouter.post("/login",login_controller)
userrouter.post("/logout",verifyjwt,logout)
userrouter.patch("/update",verifyjwt,update)
userrouter.patch("/change-password",verifyjwt,changePassword)


export default userrouter;