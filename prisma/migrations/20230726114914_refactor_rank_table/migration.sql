/*
  Warnings:

  - Added the required column `campersId` to the `TagRank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tagrank` ADD COLUMN `campersId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `TagRank` ADD CONSTRAINT `TagRank_campersId_fkey` FOREIGN KEY (`campersId`) REFERENCES `Campers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
