/*
  Warnings:

  - You are about to drop the column `keyword` on the `Keyword` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Keyword` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Store` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Keyword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewId` to the `Keyword` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Keyword` DROP FOREIGN KEY `Keyword_storeId_fkey`;

-- AlterTable
ALTER TABLE `Keyword` DROP COLUMN `keyword`,
    DROP COLUMN `storeId`,
    ADD COLUMN `name` VARCHAR(100) NOT NULL,
    ADD COLUMN `reviewId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Review` MODIFY `updatedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Store_id_key` ON `Store`(`id`);

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
