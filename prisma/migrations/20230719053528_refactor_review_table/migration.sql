/*
  Warnings:

  - You are about to drop the column `keyword` on the `keyword` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `keyword` table. All the data in the column will be lost.
  - Added the required column `name` to the `Keyword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewId` to the `Keyword` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `keyword` DROP FOREIGN KEY `Keyword_storeId_fkey`;

-- AlterTable
ALTER TABLE `keyword` DROP COLUMN `keyword`,
    DROP COLUMN `storeId`,
    ADD COLUMN `name` VARCHAR(100) NOT NULL,
    ADD COLUMN `reviewId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
