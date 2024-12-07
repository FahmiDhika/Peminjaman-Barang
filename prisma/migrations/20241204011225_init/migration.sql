-- CreateTable
CREATE TABLE `user` (
    `idUser` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL DEFAULT '',
    `password` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_uuid_key`(`uuid`),
    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `barang` (
    `idBarang` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `category` VARCHAR(191) NOT NULL DEFAULT '',
    `location` VARCHAR(191) NOT NULL DEFAULT '',
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `barang_uuid_key`(`uuid`),
    PRIMARY KEY (`idBarang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `peminjaman` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `idUser` INTEGER NULL,
    `idBarang` INTEGER NULL,
    `borrow_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `return_date` DATETIME(3) NULL,
    `actual_return` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `peminjaman` ADD CONSTRAINT `peminjaman_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `peminjaman` ADD CONSTRAINT `peminjaman_idBarang_fkey` FOREIGN KEY (`idBarang`) REFERENCES `barang`(`idBarang`) ON DELETE SET NULL ON UPDATE CASCADE;
