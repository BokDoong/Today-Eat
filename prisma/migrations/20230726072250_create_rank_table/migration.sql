-- CreateTable
CREATE TABLE `TagRank` (
    `tag` VARCHAR(191) NOT NULL,
    `rank` INTEGER NOT NULL,
    `storeId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tag`, `rank`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TagRank` ADD CONSTRAINT `TagRank_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
