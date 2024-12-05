import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

const addDataSchema = Joi.object({
    idBarang: Joi.number().required(),
    jumlah: Joi.number().required().min(1).positive(),
    lokasi_pinjam : Joi.string().required(),
    user: Joi.required()
})

const laporanPenggunaan = Joi.object({
    start_date: Joi.date().required().iso(),
    end_date: Joi.date().required().iso(),
    group_by: Joi.array().required(),
    user: Joi.required()
})

const analisisPenggunaan = Joi.object({
    start_date: Joi.date().required().iso(),
    end_date: Joi.date().required().iso(),
    user: Joi.required()
})

export const verifyPeminjaman = (request: Request, response: Response, next: NextFunction) => {
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

export const laporanPenggunaanMiddlewares = (request: Request, response: Response, next: NextFunction) => {
    // validasi data dari request body dan mengambil info error jika terdapat error
    const { error } = laporanPenggunaan.validate(request.body, { abortEarly: false })

    if (error) {
        // jika terdapat error, akan memberikan pesan seperti ini
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const analisisPenggunaanMiddlewares = (request: Request, response: Response, next: NextFunction) => {
    // validasi data dari request body dan mengambil info error jika terdapat error
    const { error } = analisisPenggunaan.validate(request.body, { abortEarly: false })

    if (error) {
        // jika terdapat error, akan memberikan pesan seperti ini
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}