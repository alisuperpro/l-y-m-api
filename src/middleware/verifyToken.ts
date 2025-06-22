import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

// Extend the Request interface to include session
interface AuthenticatedRequest extends Request {
    session?: {
        user: any
    }
}

export const verifyToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const token = req.cookies.access_token

    // Initialize session
    req.session = {
        user: null,
    }

    // Check if token exists
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token is required',
            error: 'UNAUTHORIZED',
        })
        return
    }

    // Check if JWT_KEY is configured
    if (!process.env.JWT_KEY) {
        console.error('JWT_KEY environment variable is not configured')
        res.status(500).json({
            success: false,
            message: 'Server configuration error',
            error: 'INTERNAL_SERVER_ERROR',
        })
        return
    }

    try {
        const data = jwt.verify(token, process.env.JWT_KEY) as any

        if (!data || !data.user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token format',
                error: 'INVALID_TOKEN',
            })
            return
        }

        req.session.user = data.user
        next()
    } catch (error) {
        console.error('Token verification error:', error)

        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                error: 'INVALID_TOKEN',
            })
            return
        }

        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token has expired',
                error: 'TOKEN_EXPIRED',
            })
            return
        }

        res.status(500).json({
            success: false,
            message: 'Token verification failed',
            error: 'INTERNAL_SERVER_ERROR',
        })
        return
    }
}
