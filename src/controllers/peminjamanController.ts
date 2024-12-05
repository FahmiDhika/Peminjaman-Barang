import { Request, Response } from "express";
import { PrismaClient, status } from "@prisma/client";

const prisma = new PrismaClient({errorFormat: "pretty"});

export const getAllPeminjaman = async (request: Request, response: Response) => {
    try {
        const getAllData = await prisma.peminjaman.findMany({
            include: {
                User: true,     //menyertakan informasi user
                Barang: true    //menyertakan informasi barang
            }
        })

        return response.json({
            status: `success`,
            data: getAllData,
            message: `Data peminjaman berhasil ditampilkan`
        })

    } catch (error) {
        return response.json({
            status: `failed`,
            message: `Terdapat sebuah kesalahan ${error}`
        }).status(400)
    }
}


export const pinjamBarang = async (request: Request, response: Response) => {
    try {
        const { idBarang, jumlah, lokasi_pinjam } = request.body
        const user = request.body.user

        const jumlahPinjam = jumlah

        const idUser = user.id 

        const barang = await prisma.barang.findUnique({
            where: { idBarang }
        });

        if (!barang || barang.status !== `TERSEDIA`) {
            return response.status(400).json({ error: `Barang tidak tersedia untuk dipinjam.` });
        }

        if (barang.quantity === 0) {
            return response.status(400).json({ message: "Stok barang tidak tersedia" });
        }

        if (jumlahPinjam > barang.quantity) {
            return response.json({
                message: `Tidak bisa meminjam barang karena jumlah yang diminta (${jumlahPinjam}) melebihi stok yang tersedia (${barang.quantity})`
            })
        }

        const borrowDate = new Date();
        const returnDate = new Date();
        returnDate.setDate(borrowDate.getDate() + 7);

        const peminjaman = await prisma.peminjaman.create({
            data: {
              idUser,
              idBarang,
              lokasi_pinjam,
              jumlahPinjam,
              borrow_date: new Date(),
              actual_return: returnDate
            },
        });

        await prisma.barang.update({
            where: { idBarang },
            data: {
              quantity: barang.quantity - jumlahPinjam,
              status: barang.quantity - jumlahPinjam <= 0 ? "HABIS" : "TERSEDIA",
            },
        });

        return response.json({
            status: `success`,
            data: peminjaman,
            message: `Barang berhasil dipinjam, silahkan menuju ke ruangan peminjaman. Tanggal pengembalian: ${returnDate.toLocaleDateString()}`
        }).status(200)
    } catch (error) {
        return response.json({
            status: `failed`,
            message: `Terdapat sebuah kesalahan ${error}`
        }).status(400)
    }
}

export const pengembalianBarang = async (request: Request, response: Response) => {
    try {
        const { idPeminjaman, idBarang, jumlah } = request.body;

        // Validasi jumlah
        if (!jumlah || jumlah <= 0) {
            return response.status(400).json({ message: "Jumlah barang yang dikembalikan harus lebih dari 0." });
        }

        // Cari data peminjaman
        const peminjaman = await prisma.peminjaman.findUnique({
            where: { id: idPeminjaman },
            include: { Barang: true },
        });

        if (!peminjaman) {
            return response.status(404).json({ message: "Peminjaman tidak ditemukan." });
        }

        // Validasi barang
        if (peminjaman.idBarang !== idBarang) {
            return response.status(400).json({ message: "Barang yang dikembalikan tidak sesuai dengan peminjaman." });
        }

        if (peminjaman.return_date) {
            return response.status(400).json({ message: "Barang ini sudah dikembalikan." });
        }

        const batasWaktu = peminjaman.actual_return ? new Date(peminjaman.actual_return) : null;

        const statusKembali = batasWaktu && new Date() > batasWaktu ? "TERLAMBAT" : "DIKEMBALIKAN";

        if (jumlah > peminjaman.jumlahPinjam) {
            return response.json({message: `Barang yang dikembalikan melebihi jumlah yang dipinjam`})
        }

        // Update peminjaman
        const pengembalian = await prisma.peminjaman.update({
            where: { id: idPeminjaman },
            data: {
                statusPinjam: statusKembali,
                return_date: new Date(),
            },
        });

        // Update data barang
        const barang = await prisma.barang.findUnique({ where: { idBarang: idBarang } });
        if (!barang) {
            return response.status(404).json({ message: "Barang tidak ditemukan." });
        }

        const updatedBarang = await prisma.barang.update({
            where: { idBarang: idBarang },
            data: {
                quantity: barang.quantity + jumlah,
                status: "TERSEDIA",
            },
        });

        return response.status(200).json({
            status: "success",
            message: `Barang berhasil dikembalikan. Status: ${statusKembali}`,
            data: pengembalian,
        });
    } catch (error) {
        return response.status(500).json({
            status: "error",
            message: `Terjadi kesalahan: ${error}`,
        });
    }
};


// export const laporanPenggunaan = async (request: Request, response: Response) => {
//     interface UsageAnalysis {
//         group: string; // category
//         total_borrowed: number;
//         total_returned: number;
//         items_in_use: number;
//     }

//     try {
//         const { start_date, end_date, group_by } = request.body;

//         // Pastikan start_date dan end_date valid
//         const startDate = new Date(start_date)
//         const endDate = new Date(end_date)

//         if (startDate > endDate) {
//             return response.status(400).json({ message: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir." });
//         }

//         // Pastikan group_by adalah array, dan jika hanya satu kategori, bungkus dengan array
//         const categories = Array.isArray(group_by) ? group_by : [group_by];

//         // Ambil data barang berdasarkan kategori yang diminta
//         const result = await prisma.barang.findMany({
//             where: {
//                 category: {
//                     in: categories, // Filter berdasarkan kategori
//                 },
//             },
//             include: {
//                 peminjaman: {
//                     where: {
//                         borrow_date: {
//                             gte: startDate, // Tanggal pinjam setelah atau sama dengan startDate
//                             lte: endDate, // Tanggal pinjam sebelum atau sama dengan endDate
//                         },
//                     },
//                 },
//             },
//         });

//         // Hitung data usage analysis
//         const usageAnalysisMap: { [key: string]: UsageAnalysis } = {};

//         result.forEach((barang) => {
//             const { category } = barang;

//             if (!usageAnalysisMap[category]) {
//                 usageAnalysisMap[category] = {
//                     group: category,
//                     total_borrowed: 0,
//                     total_returned: 0,
//                     items_in_use: 0,
//                 };
//             }

//             const totalBorrowed = barang.peminjaman.reduce((sum, pinjam) => sum + pinjam.jumlahPinjam, 0);
//             const totalReturned = barang.peminjaman.filter((pinjam) => pinjam.statusPinjam === 'DIKEMBALIKAN')
//               .reduce((sum, pinjam) => sum + pinjam.jumlahPinjam, 0);
//             const itemsInUse = totalBorrowed - totalReturned;

//             // Menambahkan ke total masing-masing kategori
//             usageAnalysisMap[category].total_borrowed += totalBorrowed;
//             usageAnalysisMap[category].total_returned += totalReturned;
//             usageAnalysisMap[category].items_in_use += itemsInUse;
//         });

//         // Mengonversi map menjadi array
//         const usageAnalysis: UsageAnalysis[] = Object.values(usageAnalysisMap);

//         // Response JSON sesuai format
//         return response.json({
//             status: "success",
//             data: {
//                 analysis_period: {
//                     start_date,
//                     end_date,
//                 },
//                 usage_analysis: usageAnalysis,
//             },
//         }).status(200);
//     } catch (error) {
//         return response.json({
//             status: "failed",
//             message: `Terdapat sebuah kesalahan: ${error}`,
//         }).status(400);
//     }
// };

export const laporanPenggunaan = async (request: Request, response: Response) => {
    interface UsageAnalysis {
        group: string; // kategori atau lokasi
        total_borrowed: number;
        total_returned: number;
        items_in_use: number;
    }

    try {
        const { start_date, end_date, group_by } = request.body;

        // Pastikan start_date dan end_date valid
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (startDate > endDate) {
            return response.status(400).json({ message: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir." });
        }

        // Validasi group_by hanya boleh berisi 'category' atau 'location'
        const allowedGroupBy = ['category', 'location'];
        const groupBy = Array.isArray(group_by) ? group_by : [group_by];

        // Pastikan semua nilai dalam groupBy valid (category atau location)
        if (!groupBy.every(group => allowedGroupBy.includes(group))) {
            return response.status(400).json({
                message: "group_by hanya boleh berisi 'category' atau 'location'."
            });
        }

        // Ambil data barang dan peminjaman berdasarkan kriteria yang diminta
        const result = await prisma.barang.findMany({
            include: {
                peminjaman: {
                    where: {
                        borrow_date: {
                            gte: startDate, // Tanggal pinjam setelah atau sama dengan startDate
                            lte: endDate, // Tanggal pinjam sebelum atau sama dengan endDate
                        },
                    },
                    select: {
                        lokasi_pinjam: true, // Lokasi pinjam dari peminjaman
                        jumlahPinjam: true,
                        statusPinjam: true,
                    },
                },
            },
        });

        if (result.length === 0) {
            return response.status(200).json({
                status: "success",
                message: "Tidak ada data yang ditemukan untuk periode ini.",
                data: [],
            });
        }

        // Hitung data usage analysis
        const usageAnalysisMap: { [key: string]: UsageAnalysis } = {};

        result.forEach((barang) => {
            const { category, peminjaman } = barang;

            // Kelompokkan berdasarkan kategori atau lokasi
            peminjaman.forEach((pinjam) => {
                const { lokasi_pinjam } = pinjam; // Ambil lokasi dari peminjaman

                // Kelompokkan berdasarkan kategori jika groupBy termasuk 'category'
                if (groupBy.includes("category") && !usageAnalysisMap[category]) {
                    usageAnalysisMap[category] = {
                        group: category,
                        total_borrowed: 0,
                        total_returned: 0,
                        items_in_use: 0,
                    };
                }

                // Kelompokkan berdasarkan lokasi jika groupBy termasuk 'location'
                if (groupBy.includes('location') && !usageAnalysisMap[lokasi_pinjam]) {
                    usageAnalysisMap[lokasi_pinjam] = {
                        group: lokasi_pinjam,
                        total_borrowed: 0,
                        total_returned: 0,
                        items_in_use: 0,
                    };
                }

                // Hitung jumlah peminjaman dan pengembalian
                const totalBorrowed = pinjam.jumlahPinjam;
                const totalReturned = pinjam.statusPinjam === 'DIKEMBALIKAN' ? pinjam.jumlahPinjam : 0;
                const itemsInUse = totalBorrowed - totalReturned;

                // Menambahkan ke total masing-masing kategori atau lokasi
                if (groupBy.includes('category')) {
                    usageAnalysisMap[category].total_borrowed += totalBorrowed;
                    usageAnalysisMap[category].total_returned += totalReturned;
                    usageAnalysisMap[category].items_in_use += itemsInUse;
                }

                if (groupBy.includes('location')) {
                    usageAnalysisMap[lokasi_pinjam].total_borrowed += totalBorrowed;
                    usageAnalysisMap[lokasi_pinjam].total_returned += totalReturned;
                    usageAnalysisMap[lokasi_pinjam].items_in_use += itemsInUse;
                }
            });
        });

        // Mengonversi map menjadi array
        const usageAnalysis: UsageAnalysis[] = Object.values(usageAnalysisMap);

        // Response JSON sesuai format
        return response.json({
            status: "success",
            data: {
                analysis_period: {
                    start_date,
                    end_date,
                },
                usage_analysis: usageAnalysis,
            },
        }).status(200);

    } catch (error) {
        return response.json({
            status: "failed",
            message: `Terdapat sebuah kesalahan: ${error}`,
        }).status(400);
    }
};

export const analisisBarang = async (request: Request, response: Response) => {
    try {
        const { start_date, end_date } = request.body

        const startDate = new Date(start_date)
        const endDate = new Date(end_date)

        const frequentlyBorrowedItems = await prisma.peminjaman.groupBy({
            by: ['idBarang'],
            where: {
                borrow_date: {
                    gte: startDate,
                },
                return_date: {
                    lte: endDate,
                },
            },
            _count: {
                idBarang: true,
            },
            orderBy: {
                _count: {
                    idBarang: 'desc',
                }
            },
        });

        // Mendapatkan informasi tambahan untuk barang paling sering dipinjam
        const frequentlyBorrowedItemDetails = await Promise.all(frequentlyBorrowedItems.map(async item => {
            if (item.idBarang === null) {
                // Jika idBarang null, abaikan atau tangani kasus ini
                return null;
            }
        
            const barang = await prisma.barang.findUnique({
                where: { idBarang: item.idBarang },  // idBarang sekarang tidak akan pernah null
                select: { idBarang: true, name: true, category: true },
            });
        
            return barang ? {
                idBarang: item.idBarang,
                name: barang.name,
                category: barang.category,
                total_borrowed: item._count.idBarang,
            } : null;
        })).then(results => results.filter(item => item !== null));  // Menghapus item yang null
        

        // Query untuk mendapatkan barang dengan telat pengembalian
        const inefficientItems = await prisma.peminjaman.groupBy({
            by: ['idBarang'],
            where: {
                borrow_date: {
                    gte: startDate,
                },
                actual_return: {
                    gt: endDate // Asumsikan telat pengembalian adalah jika return_date lebih besar dari end_date
                }
            },
            _count: {
                idBarang: true,
            },
            _sum: {
                jumlahPinjam: true,
            },
            orderBy: {
                _count: {
                    idBarang: 'desc',
                }
            },
        });

        // Mendapatkan informasi tambahan untuk barang yang telat pengembalian
        const inefficientItemDetails = await Promise.all(inefficientItems.map(async item => {
            if (item.idBarang === null) {
                // Jika idBarang null, abaikan atau tangani kasus ini
                return null;
            }
        
            const barang = await prisma.barang.findUnique({
                where: { idBarang: item.idBarang },  // idBarang sekarang tidak akan pernah null
                select: { idBarang: true, name: true, category: true },
            });

            return barang ? {
                idBarang: item.idBarang,
                name: barang.name,
                category: barang.category,
                total_borrowed: item._count.idBarang,
                total_late_returns: item._sum?.jumlahPinjam ?? 0, // Menangani kemungkinan nilai undefined
            } : null;
        })).then(results => results.filter(item => item !== null)); // Menghapus item yang null

        response.status(200).json({
            status: "success",
            data: {
                analysis_period: {
                    start_date: start_date,
                    end_date: end_date
                },
                frequently_borrowed_items: frequentlyBorrowedItemDetails,
                inefficient_items: inefficientItemDetails
            },
            message: "Analisis barang berhasil dihasilkan.",
        });
    } catch (error) {
        return response.json({
            status: "failed",
            message: `Terdapat sebuah kesalahan: ${error}`,
        }).status(400)
    }
};
