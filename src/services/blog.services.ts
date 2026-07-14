import { prisma } from "../db/db.js";
import { Prisma } from "@prisma/client";
import type { createBlogbody } from "../controllers/blog.controler.js";

export const createService = async (data: createBlogbody,authorId: string) => {
    return await prisma.post.create({
        data: {
            ...data,
            authorId
        }
    });
};


export const getblogs = async(page : number ,limit : number,search:string,sort : string, order : string,author:string)=>{
    const skip = (page - 1)*limit;
    // const where :Prisma.PostWhereInput = (search || author) ? {
    //     OR :[
    //         {
    //             title : {
    //                 contains : search,
    //                 mode : "insensitive",
    //             }
    //         }, 
    //         {
    //             content : {
    //                 contains : search,
    //                 mode : "insensitive"
    //             }
    //         }
    //     ],
    //     authorId : author
    // } : {};
    const where : any = {};
    if(search){
        where.OR = [
             {
                title : {
                    contains : search,
                    mode : "insensitive",
                }
            }, 
            {
                content : {
                    contains : search,
                    mode : "insensitive"
                }
            }
        ]
    }
    if(author){
        where.authorId = author;
    }

    //does multiple processes in same time instead of adding onto i
    const [posts,totalposts] = await Promise.all([
        prisma.post.findMany({
            where,
            skip,
            take : limit,

            orderBy:{
                [sort] : order
            },
            include:{
                author : {
                    select:{
                        id : true,
                        name : true,
                        email : true
                    }
                }
            }
        }),
        prisma.post.count({
            where
        })
    ])
    const totalPages = Math.ceil(totalposts/limit)

    return {
        posts,
        meta  :{
            page,
            limit,
            totalPages,
            totalposts
        }
    }
}


export const findblog =async(id:string)=>{
    return await prisma.post.findUnique({
        where :{
            id
        }

    })
}

export const updateblogservice = async(id:string,title:string,content:string)=>{
    return await prisma.post.update({
        where:{
            id
        },
        data:{
            title,content
        }
    })
}

export const deleteblogservice = async(id:string)=>{
    const post  = await prisma.post.update({
        where:{
            id : id
        },
        data :{
            isDeleted : true,
            deletedAt : new Date()
        }
    })
}

export const bookmarkThePost = async(postid : string,userid:string)=>{
    const post  = await prisma.user.update({
        where : {
            id : userid
        },
        data : {
            bookmarks:{
                connect : {
                    id : postid
                }
            }
        },
        select:{
            bookmarks:true
        }
    })

    return post;
}