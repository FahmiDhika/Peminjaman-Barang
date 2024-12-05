import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import md5 from "md5";
import { SECRET } from "../global";
import { sign } from "jsonwebtoken"

const prisma = new PrismaClient({ errorFormat: "pretty" });

export const getAllUser = async (request: Request, response: Response) => {
    try {
        const getUser = await prisma.user.findMany({})

        return response.json({
            status: `success`,
            data: getUser,
            message: `User berhasil ditampikan`
        })
    } catch (error) {
        return response.status(400).json({
            status: "failed",
            message: `Terdapat sebuah kesalahan: ${error}`
        });
    }
}

export const newUser = async (request: Request, response: Response) => {
    try {
        const { username, password, role } = request.body;

        // Mengecek apakah username sudah ada di database
        const existingUser = await prisma.user.findFirst({
            where: { username }
        });

        if (existingUser) {
            return response.status(400).json({
                status: "failed",
                message: `Username ${username} sudah terdaftar`
            });
        }

        // Jika tidak ada yang duplikat, lanjutkan pembuatan user baru
        const newUser = await prisma.user.create({
            data: { username, password: md5(password), role }
        });

        return response.status(200).json({
            status: "success",
            data: newUser,
            message: "User berhasil dibuat"
        });

    } catch (error) {
        return response.status(400).json({
            status: "failed",
            message: `Terdapat sebuah kesalahan: ${error}`
        });
    }
};


export const updateUser = async (request: Request, response: Response) => {
    try {
        const { id } = request.params
        const { username, password, role } = request.body

        const findUser = await prisma.user.findFirst({where: { idUser: Number(id) } })
        if (!findUser) return response.status(200).json({
            status: `failed`,
            message: `User tidak ditemukan`
        })

        const updateUser = await prisma.user.update({
            data: {
                username: username || findUser.username,
                password: password ? md5(password) : findUser.password,
                role: role || findUser.role
            },
            where: { idUser: Number(id)}
        })

        return response.json({
            status: `success`,
            data: updateUser,
            message: `User berhasil diupdate`
        }).status(200)
    } catch (error) {
        return response.json({
            status: `failed`,
            message: `Terdapat sebuah kesalahan ${error}`
        }).status(400)
    }
}

export const deleteUser = async (request: Request, response: Response) => {
    try {
        const { id } = request.params

        const findUser = await prisma.user.findFirst({where: { idUser: Number(id) } })
        if (!findUser) return response.status(200).json({
            status: false,
            message: `User tidak ditemukan`
        })

        const deleteUser = await prisma.user.delete({
            where: { idUser: Number(id) }
        })

        return response.json({
            status: true,
            data: deleteUser,
            message: `User berhasil dihapus`
        }).status(200)
    } catch(error) {
        return response.json({
            status: true,
            message: `Terjadi sebuah kesalahan ${error}`
        }).status(400)
    }
}

export const authentication = async (request: Request, response: Response) => {
    try {
        const { username, password } = request.body

        const findUser = await prisma.user.findFirst({
            where: { username, password: md5(password) }
        })

        if (!findUser) return response.status(200).json({
            status: false,
            logged: false,
            message: `Username atau Password invalid`
        })

        let data = {
            id: findUser.idUser,
            name: findUser.username,
            role: findUser.role
        }

        let payload = JSON.stringify(data)

        let token = sign(payload, SECRET || "token" )

        return response.json({
            status: true,
            logged: true,
            message: `Login sukses`,
            token
        }).status(200)
    } catch (error) {
        return response.json({
            status: true,
            message: `Terjadi sebuah kesalahan ${error}`
        }).status(400)
    }
}