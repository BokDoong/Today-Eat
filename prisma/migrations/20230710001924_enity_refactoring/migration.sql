/*
  Warnings:

  - Added the required column `universityId` to the `Campers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `score` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campersId` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campersId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Campers` ADD COLUMN `universityId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Review` ADD COLUMN `content` TEXT NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `score` DOUBLE NOT NULL,
    ADD COLUMN `storeId` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Store` ADD COLUMN `campersId` VARCHAR(191) NOT NULL,
    ADD COLUMN `categoryId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `campersId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `ReviewLike` (
    `userId` VARCHAR(191) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `reviewId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(20) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WishList` (
    `userId` VARCHAR(191) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`userId`, `storeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StoreImage` (
    `storeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`storeId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReviewImage` (
    `imageUrl` VARCHAR(200) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ReviewImage_imageUrl_key`(`imageUrl`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Keyword` (
    `id` VARCHAR(191) NOT NULL,
    `keyword` VARCHAR(100) NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` VARCHAR(191) NOT NULL,
    `refreshToken` VARCHAR(200) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `RefreshToken_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notice` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(50) NOT NULL,
    `content` TEXT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_campersId_fkey` FOREIGN KEY (`campersId`) REFERENCES `Campers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campers` ADD CONSTRAINT `Campers_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store` ADD CONSTRAINT `Store_campersId_fkey` FOREIGN KEY (`campersId`) REFERENCES `Campers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Store` ADD CONSTRAINT `Store_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewLike` ADD CONSTRAINT `ReviewLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewLike` ADD CONSTRAINT `ReviewLike_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishList` ADD CONSTRAINT `WishList_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WishList` ADD CONSTRAINT `WishList_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StoreImage` ADD CONSTRAINT `StoreImage_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewImage` ADD CONSTRAINT `ReviewImage_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tag` ADD CONSTRAINT `Tag_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
