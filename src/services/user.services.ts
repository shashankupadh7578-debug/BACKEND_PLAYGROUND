import { prisma } from "../db/db.js";
import jwt from "jsonwebtoken"
import bcrypt from  "bcrypt"

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("Missing JWT secrets in environment variables");
}

export const registerUser = async(name : string,email:string,password:string)=> {
    try {

        const existinguser = await prisma.user.findUnique({
            where : {email}
        })
        if(existinguser){
            throw new Error("user already exists")
        }
        const hashedpassword = await bcrypt.hash(password,10)
        const user = await prisma.user.create({
            data : {name : name,email : email,password : hashedpassword}
        })
        return user;
    } catch (err) {
         throw err;
    }
}


export const login = async(email :string,password :string)=>{
    try {
        if(!email || !password){
            throw new Error("input valid credentials")
        }
        const user = await prisma.user.findUnique({
            where : {email}
        })
        if(!user){
            throw new Error("user doesnt exists please register")
        }
        const isvalid = await bcrypt.compare(password,user.password)
        if(!isvalid){
            throw new Error("wrong password")
        }

        //2fa if ever exists

        const accesstoken = jwt.sign(
            {userid : user.id,email:user.email},ACCESS_TOKEN_SECRET,{expiresIn:"15m"}
        )
        //TOKEN ERROR SAVED BY ALREADY ACKNOWLEDGING ENV ERROR ON TOP
        const refreshtoken = jwt.sign(
            {userid : user.id,email:user.email},REFRESH_TOKEN_SECRET,{expiresIn:"7d"}
        )

        await prisma.user.update({
            where:{id : user.id},
            data : {refreshToken : refreshtoken}
        })

        return {refreshtoken,accesstoken}
    } catch (error) {
        throw error
    }
}

export const updateTheUser = async(id : string,newname : string)=>{
    const user = await prisma.user.update({
        where : {
            id : id
        },
        data : {
            name : newname
        }
    })
    return user;
}

export const changeThePassword = async(id :string,password:string)=>{
    const changepassword = await prisma.user.update({
        where:{
            id
        },
        data : {
            password : password
        }
    })
    return changepassword
}