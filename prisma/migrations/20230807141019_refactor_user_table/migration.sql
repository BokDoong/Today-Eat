/*
  Warnings:

  - Made the column `campersId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_campersId_fkey`;

-- AlterTable
ALTER TABLE `User` MODIFY `campersId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_campersId_fkey` FOREIGN KEY (`campersId`) REFERENCES `Campers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
