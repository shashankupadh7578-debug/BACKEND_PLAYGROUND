import express from "express"
import { verifyjwt } from "../middlewares/verifyjwt.js"
import { createpost,getallblogs,getablog,updateblog,deleteblog} from "../controllers/blog.controler.js"
const blogrouter = express.Router()

blogrouter.post("/create",verifyjwt,createpost)
blogrouter.get("/getblogs",verifyjwt,getallblogs)
blogrouter.get("/find/:id",verifyjwt,getablog)
blogrouter.patch("/update/:id",verifyjwt,updateblog)
blogrouter.delete("/delete/:id",verifyjwt,deleteblog)


export default blogrouter;