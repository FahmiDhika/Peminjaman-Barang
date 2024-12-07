/*
  Warnings:

  - You are about to drop the column `stauts` on the `barang` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `barang` DROP COLUMN `stauts`,
    ADD COLUMN `status` ENUM('TERSEDIA', 'HABIS') NOT NULL DEFAULT 'TERSEDIA';
