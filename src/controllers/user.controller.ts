import { prisma } from "../db/db.js"
import { login, registerUser,updateTheUser ,changeThePassword} from "../services/user.services.js"
import type { Request, Response } from "express"
import type { Authrequest } from "../middlewares/verifyjwt.js"
import bcrypt from  "bcrypt"
export const register_controller = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body
        const user = await registerUser(name, email, password)
        return res.status(200).json({ message: "user created successsfully", success: true })
    } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error hitted on register controller"

        return res.status(500).json({ message: `register controller error || ${message}` })
    }
}

export const login_controller = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const { refreshtoken, accesstoken } = await login(email, password)

        res.cookie("accessToken", accesstoken, {
            httpOnly: true,
            secure: true,        // set false only in local http dev
            sameSite: "none",    // or "lax" if same-site setup
            maxAge: 15 * 60 * 1000, // 15 min
        })
            .cookie("refreshToken", refreshtoken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

        return res.status(200).json({ message: "user logged in" })
    } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error hitted on login controller"
        return res.status(500).json({ message: `login controller error || ${message}` })
    }
}

export const logout = async (req: Authrequest, res: Response) => {
    try {
         await prisma.user.update({
            where: {
                id: req.user!.userid
            },
            data: {
                refreshToken: null
            }
        })

            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return res.status(200).json({message:"logout successful",success:true})
    } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error hitted on logout controller"
        return res.status(500).json({ message: `logout controller error || ${message}` })
    }
}


export const update  = async(req:Authrequest,res:Response) =>{
    try {
        const id = req.user!.userid
        const {name} = req.body
        if(!name || !id){
            return res.status(400).json({message  :"insuffecient details",success:false})
        }
        const updatedUser = await updateTheUser(id,name);
        return res.status(200).json({message : "update success",updatedUser,success:true})
    } catch (error) {
        const message = error instanceof Error ? error.message : "unknown error hitted on logout controller"
        return res.status(500).json({ message: `update controller error || ${message}` })
    }
}

export const changePassword = async(req:Authrequest,res:Response)=>{
    try {
        const id = req.user!.userid
        const {oldpassword,newpassword,confirmedpassword} = req.body
        if(!oldpassword || !id || !newpassword || !confirmedpassword){
            return res.status(400).json({message  :"insufficent data",success:false})
        }
        const existinguser = await prisma.user.findUnique({
            where:{
                id : id
            }
        })
        if(!existinguser){
            return res.status(400).json({message : "user cant be found",success:false})
        }
        if(newpassword !== confirmedpassword){
            return res.status(400).json({message : "new and confirmed pasword mismatch",success:false})
        }
        if(oldpassword === newpassword){
            return res.status(400).json({message  : "same password not allowed",success:false})
        }
        // const hashedpasswordold = await bcrypt.hash(oldpassword,10)
        const hashedpasswordnew = await bcrypt.hash(newpassword,10)
        const isCorrect = await bcrypt.compare(oldpassword,existinguser?.password)
        if(!isCorrect){
            return res.status(400).json({message : "password incorrect",success:false})
        }
        
        const changepass = await changeThePassword(id,hashedpasswordnew)

        return res.status(200).json({message : "password changed successfully",changepass,success:true})
    } catch (error) {
         const message = error instanceof Error ? error.message : "unknown error hitted on logout controller"
        return res.status(500).json({ message: `change password controller error || ${message}` })
    }
}