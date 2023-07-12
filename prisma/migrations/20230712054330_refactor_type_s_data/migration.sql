/*
  Warnings:

  - The values [INQUIRY] on the enum `Notices_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Notices` MODIFY `type` ENUM('NOTICE', 'FAQ', 'TERMS') NOT NULL;
