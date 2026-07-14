import { prisma } from "../db/db.js"
import { login, registerUser } from "../services/user.services.js"
import type { Request, Response } from "express"
import type { Authrequest } from "../middlewares/verifyjwt.js"
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
