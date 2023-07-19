/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoreImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,campersId]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Store` DROP FOREIGN KEY `Store_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `StoreImage` DROP FOREIGN KEY `StoreImage_storeId_fkey`;

-- AlterTable
ALTER TABLE `BusinessHour` MODIFY `monOpen` VARCHAR(191) NOT NULL,
    MODIFY `monClose` VARCHAR(191) NOT NULL,
    MODIFY `tueOpen` VARCHAR(191) NOT NULL,
    MODIFY `tueClose` VARCHAR(191) NOT NULL,
    MODIFY `wedOpen` VARCHAR(191) NOT NULL,
    MODIFY `wedClose` VARCHAR(191) NOT NULL,
    MODIFY `thuOpen` VARCHAR(191) NOT NULL,
    MODIFY `thuClose` VARCHAR(191) NOT NULL,
    MODIFY `friOpen` VARCHAR(191) NOT NULL,
    MODIFY `friClose` VARCHAR(191) NOT NULL,
    MODIFY `satOpen` VARCHAR(191) NOT NULL,
    MODIFY `satClose` VARCHAR(191) NOT NULL,
    MODIFY `sunOpen` VARCHAR(191) NOT NULL,
    MODIFY `sunClose` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Store` DROP COLUMN `categoryId`,
    ADD COLUMN `category` VARCHAR(191) NOT NULL,
    ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    ADD COLUMN `place_id` VARCHAR(191) NULL,
    MODIFY `phoneNumber` VARCHAR(13) NOT NULL;

-- DropTable
DROP TABLE `Category`;

-- DropTable
DROP TABLE `StoreImage`;

-- CreateIndex
CREATE UNIQUE INDEX `Store_name_campersId_key` ON `Store`(`name`, `campersId`);
