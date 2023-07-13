/*
  Warnings:

  - You are about to drop the column `closing_time` on the `store` table. All the data in the column will be lost.
  - You are about to drop the column `opening_time` on the `store` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `store` table. All the data in the column will be lost.
  - Added the required column `distance` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `StoreImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `store` DROP COLUMN `closing_time`,
    DROP COLUMN `opening_time`,
    DROP COLUMN `status`,
    ADD COLUMN `distance` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `storeimage` ADD COLUMN `imageUrl` VARCHAR(200) NOT NULL;

-- CreateTable
CREATE TABLE `BusinessHour` (
    `storeId` VARCHAR(191) NOT NULL,
    `monOpen` TIME NOT NULL,
    `monClose` TIME NOT NULL,
    `tueOpen` TIME NOT NULL,
    `tueClose` TIME NOT NULL,
    `wedOpen` TIME NOT NULL,
    `wedClose` TIME NOT NULL,
    `thuOpen` TIME NOT NULL,
    `thuClose` TIME NOT NULL,
    `friOpen` TIME NOT NULL,
    `friClose` TIME NOT NULL,
    `satOpen` TIME NOT NULL,
    `satClose` TIME NOT NULL,
    `sunOpen` TIME NOT NULL,
    `sunClose` TIME NOT NULL,

    UNIQUE INDEX `BusinessHour_storeId_key`(`storeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BusinessHour` ADD CONSTRAINT `BusinessHour_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
