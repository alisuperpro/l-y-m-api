import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.access_token

    //@ts-ignore
    req.session = {
        user: null,
    }

    try {
        const data = jwt.sign(token, process.env.JWT_KEY ?? '')
        //@ts-ignore
        req.session.user = data
    } catch {}
    next()
}
