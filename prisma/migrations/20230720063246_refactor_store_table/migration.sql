/*
  Warnings:

  - Added the required column `storeId` to the `Keyword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `keyword` ADD COLUMN `storeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tag` ADD COLUMN `storeId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
