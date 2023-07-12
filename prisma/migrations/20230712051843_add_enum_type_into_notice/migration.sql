/*
  Warnings:

  - Added the required column `type` to the `Notices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Notices` ADD COLUMN `type` ENUM('NOTICE', 'INQUIRY', 'TERMS') NOT NULL;
