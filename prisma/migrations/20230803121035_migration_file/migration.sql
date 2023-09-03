/*
  Warnings:

  - The primary key for the `TagRank` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `campersId` to the `TagRank` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_userId_fkey`;

-- AlterTable
ALTER TABLE `TagRank` DROP PRIMARY KEY,
    ADD COLUMN `campersId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`tag`, `rank`, `campersId`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TagRank` ADD CONSTRAINT `TagRank_campersId_fkey` FOREIGN KEY (`campersId`) REFERENCES `Campers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
