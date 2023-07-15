-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `User_campersId_fkey`;

-- AlterTable
ALTER TABLE `user` MODIFY `campersId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_campersId_fkey` FOREIGN KEY (`campersId`) REFERENCES `Campers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
