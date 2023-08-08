/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `review` table. All the data in the column will be lost.
  - You are about to drop the column `place_id` on the `store` table. All the data in the column will be lost.
  - You are about to drop the `businesshour` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `businesshour` DROP FOREIGN KEY `BusinessHour_storeId_fkey`;

-- AlterTable
ALTER TABLE `review` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `store` DROP COLUMN `place_id`;

-- DropTable
DROP TABLE `businesshour`;
