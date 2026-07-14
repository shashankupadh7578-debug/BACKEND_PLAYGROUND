import { prisma } from "../db/db.js"
import type { Request, Response } from "express"
import type { Authrequest } from "../middlewares/verifyjwt.js"
import { createService, getblogs, findblog, updateblogservice, deleteblogservice } from "../services/blog.services.js"
import { bookmarkThePost } from "../services/blog.services.js"
export interface createBlogbody {
    title: string,
    content: string,

}
export interface blogparam {
    id: string
}

type blogtype = Request<blogparam, {}, createBlogbody, {}>

export const createpost = async (req: Authrequest, res: Response) => {
    try {
        const { title, content } = req.body
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const post = await createService(
            {
                title,
                content
            },
            req.user.userid
        );

        return res.status(201).json({
            success: true,
            post
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "weird error | create controller"
        return res.status(500).json({ message: `create controller error | ${message}` })
    }
}

//ADDED ADVANCED QUERY IN GETBLOGS


export const getallblogs = async (req: Authrequest, res: Response) => {
    try { 
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        let page  = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 10;
        const search  = req.query.search as string || ""

        let sort = req.query.sort as string || "createdAt"
        let order = (req.query.order as "asc" | "desc") || "desc"
        const author = req.query.author as string


        //validation
        if(page < 1){
            page = 1;
        }
        if(limit < 1){
            limit =10;
        }
        if(limit > 100){
            limit = 100;
        }
        const allowedSorts : string[] = [
            "title",
            "createdAt"
        ]
        if(!allowedSorts.includes(sort)){
            sort = "createdAt"
        }
        if(order !== "asc" && order !== "desc"){
            order = "desc"
        }
        
        const {posts,meta} = await getblogs(page,limit,search,sort,order,author)

        return res.status(200).json({ posts,meta, success: true })
    } catch (error) {
        const message = error instanceof Error ? error.message : "weird error | getallblogs controller"
        return res.status(500).json({ message: `getblog controller error | ${message}` })
    }
}


export const getablog = async (req: Authrequest, res: Response) => {
    try {
        const { id } = req.params
        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid blog id"
            });
        }
        if (!id) {
            return res.status(401).json({
                message: "Token missing"
            });
        }
        const blog = await findblog(id)
        if (!blog) {
            return res.status(404).json({ message: "blog doesnt exist", success: false })
        }
        return res.status(200).json({
            success: true,
            blog
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : "weird error | getablog controller"
        return res.status(500).json({ message: `create controller error | ${message}` })
    }
}
export const updateblog = async(req:Authrequest,res:Response)=>{
    try {
        const {id} = req.params
        const {title,content}=req.body
        
        if(typeof id !== "string"){
            return res.status(400).json({message:"wromg id",success:false})
        }
        const blog =  await findblog(id)
        if(blog!.authorId !== req.user?.userid){
            return res.status(400).json({message:"dont touch other people's blogs asshole",success:false})
        }
        const updatedblog = await updateblogservice(id,title,content)
        return res.status(200).json({message:"blog updated",updatedblog,success:true})

    } catch (error) {
         const message = error instanceof Error ? error.message : "weird error | update controller"
        return res.status(500).json({ message: `create controller error | ${message}` })
    
    }
}

export const deleteblog = async(req:Authrequest,res:Response)=>{
    try {
        const {id} = req.params
        if(typeof id !== "string"){
            return res.status(400).json({message:"wrong id type",success:false})
        }
        const blog =  await findblog(id)
        if(!blog){
            return res.status(400).json({message : "blog doesnt exist" , success :false})
        }
        if(blog!.authorId !== req.user?.userid){
            return res.status(400).json({message:"dont touch other people's blogs asshole",success:false})
        }
        const deletedblog = await deleteblogservice(id)
    
        return res.status(200).json({message:"blog deleted",deletedblog,success:true})
    } catch (error) {
        const message = error instanceof Error ? error.message : "weird error | delete controller"
        return res.status(500).json({ message: `create controller error | ${message}` })
    }
}



export const bookmarkPost = async(req:Authrequest,res:Response)=>{
    try {
        const {postid} = req.params
        const userid = req.user?.userid
        if(typeof postid !== "string"){
            return res.status(400).json({message : "postid is not string",success:false})
        }
        if(!postid || !userid){
            return res.status(400).json({message : "invalid credentials",success:false})
        }

        const bookmarked = await bookmarkThePost(postid,userid)

        return res.status(200).json({message : "post bookmarked",bookmarked,success:true})
    } catch (error) {
         const message = error instanceof Error ? error.message : "weird error | delete controller"
        return res.status(500).json({ message: `create controller error | ${message}` })
    }
}



