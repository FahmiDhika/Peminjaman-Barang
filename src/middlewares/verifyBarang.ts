import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const addDataSchema = Joi.object({
    name: Joi.string().required(),
    category: Joi.string().required(),
    quantity: Joi.number().min(1).positive().required(),
    location: Joi.string().required(),
    status: Joi.string().valid(`TERSEDIA`, `HABIS`).required(),
    user: Joi.required()
})

export const updateDataSchema = Joi.object({
    name: Joi.string().optional(),
    category: Joi.string().optional(),
    quantity: Joi.number().min(1).optional(),
    location: Joi.string().optional(),
    status: Joi.string().valid(`TERSEDIA`, `HABIS`).optional(),
    user: Joi.required()
})

export const verifyAddBarang = (request: Request, response: Response, next: NextFunction) => {
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

export const verifyEditBarang = (request: Request, response: Response, next: NextFunction) => {
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