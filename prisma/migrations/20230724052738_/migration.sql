/*
  Warnings:

  - A unique constraint covering the columns `[university_email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `Keyword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Keyword` ADD COLUMN `storeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Tag` ADD COLUMN `storeId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isEmailAuth` TINYINT NOT NULL DEFAULT 0,
    ADD COLUMN `university_email` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_university_email_key` ON `User`(`university_email`);

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
