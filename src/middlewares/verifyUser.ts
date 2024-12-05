import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const addDataSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    role: Joi.string().valid("ADMIN", "USER").required()
})

export const updateDataSchema = Joi.object({
    username: Joi.string().optional(),
    password: Joi.string().optional(),
    role: Joi.string().valid("ADMIN", "USER").required()
})

export const authSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(3).alphanum().required()
})

export const verifyAuthentication = (request: Request, response: Response, next: NextFunction) => {
    const { error } = authSchema.validate(request.body, { abortEarly: false })

    if (error) {
        return response.status(400).json({
            status: false,
            message: error.details.map((it) => it.message).join()
        })
    }
    return next()
}

export const verifyAddUser = (request: Request, response: Response, next: NextFunction) => {
    // validasi data dari request body dan mengambil info error jika terdapat error
    const { error } = addDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        // jika terdapat error, akan memberikan pesan seperti ini
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditUser = (request: Request, response: Response, next: NextFunction) => {
    // validasi data dari request body dan mengambil info error jika terdapat error
    const { error } = updateDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        // jika terdapat error, akan memberikan pesan seperti ini
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}