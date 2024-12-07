/*
  Warnings:

  - You are about to alter the column `category` on the `barang` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `barang` MODIFY `category` ENUM('ELEKTRONIK', 'NON_ELEKTRONIK') NOT NULL DEFAULT 'ELEKTRONIK';
