/*
  Warnings:

  - Made the column `campersId` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_campersId_fkey`;

-- AlterTable
ALTER TABLE `user` MODIFY `campersId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_campersId_fkey` FOREIGN KEY (`campersId`) REFERENCES `Campers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
