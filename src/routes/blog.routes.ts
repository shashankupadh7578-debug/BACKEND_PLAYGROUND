import express from "express"
import { verifyjwt } from "../middlewares/verifyjwt.js"
import { createpost,getallblogs,getablog,updateblog,deleteblog,bookmarkPost,removeBookmarkController,getMyBookmarks} from "../controllers/blog.controler.js"
const blogrouter = express.Router()

blogrouter.post("/create",verifyjwt,createpost)
blogrouter.get("/getblogs",verifyjwt,getallblogs)
blogrouter.get("/find/:id",verifyjwt,getablog)
blogrouter.patch("/update/:id",verifyjwt,updateblog)
blogrouter.delete("/delete/:id",verifyjwt,deleteblog)


blogrouter.post("/bookmark/:id", verifyjwt, bookmarkPost)
blogrouter.delete("/bookmark/:id", verifyjwt, removeBookmarkController)
blogrouter.get("/bookmarks/my", verifyjwt, getMyBookmarks)
export default blogrouter;