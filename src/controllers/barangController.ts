import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllBarang = async (request: Request, response: Response) => {
    try {
        const getBarang = await prisma.barang.findMany({})

        return response.json({
            status: `success`,
            message: `Data barang berhasil ditampilkan`,
            data: getBarang
        }).status(200)
    } catch (error) {
        return response.json({
            status: `failed`,
            message: `Terdapat sebuah kesalahan ${error}`
        }).status(400)
    }
}

export const getBarang = async (request: Request, response: Response) => {
    try {
        const { search } = request.query

        const getBarang = await prisma.barang.findMany({
            where: { name: { contains: search?.toString() || "" }}
        })

        return response.json({
            status: `success`,
            data: getBarang,
            message: `Data barang berhasil ditampilkan`
        }).status(200)
    } catch (error) {
        return response.json({
            status: `failed`,
            message: `Terdapat sebuah kesalahan ${error}`
        }).status(400)
    }
}

export const newBarang = async (request: Request, response: Response) => {
    try {
        const { name, category, quantity, status, location } = request.body

        // Mengecek apakah username sudah ada di database
        const existingBarang = await prisma.barang.findFirst({
            where: { name }
        });

        if (existingBarang) {
            return response.status(400).json({
                status: "failed",
                message: `Barang ${name} sudah terdaftar`
            });
        }

        const newBarang = await prisma.barang.create({
            data: {
            name, category, quantity: Number(quantity), location, status
        }
        })

        return response.json({
            status: true,
            data: newBarang,
            massage: `Barang Telah Berhasil Ditambahkan`
        }).status(200)

    } catch (error) {
        return response.json({
            status: `failed`,
            message: `Terdapat sebuah kesalahan ${error}`
        }).status(400)
    }
}

export const updateBarang = async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const { name, category, quantity, status, location } = request.body

        const findBarang = await prisma.barang.findFirst({where: { idBarang: Number(id) } })
        if (!findBarang) return response.status(200).json({
            status: `failed`,
            message: `Barang tidak ditemukan`
        })

        const updateBarang = await prisma.barang.update({
            data: {
                name: name || findBarang.name,
                category: category || findBarang.category,
                quantity: quantity? Number(quantity) : findBarang.quantity,
                location: location || findBarang.location,
                status: status || findBarang.status
            },
            where: { idBarang: Number(id)}
        })

        return response.json({
            status: `success`,
            data: updateBarang,
            message: `Barang berhasil diupdate`
        }).status(200)
    } catch (error) {
        return response.json({
            status: `failed`,
            message: `Terdapat sebuah kesalahan ${error}`
        }).status(400)
    }
}

export const deleteBarang = async (request: Request, response: Response) => {
    try {
        const { id } = request.params

        const findUser = await prisma.barang.findFirst({where: { idBarang: Number(id) } })
        if (!findUser) return response.status(200).json({
            status: false,
            message: `Barang tidak ditemukan`
        })

        const deleteUser = await prisma.barang.delete({
            where: { idBarang: Number(id) }
        })

        return response.json({
            status: `success`,
            message: `Barang berhasil dihapus`
        }).status(200)
    } catch (error) {
        return response.json({
            status: `failed`,
            message: `Terdapat sebuah kesalahan ${error}`
        }).status(400)
    }
}