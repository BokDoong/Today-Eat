/*
  Warnings:

  - The primary key for the `tagrank` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `tagrank` DROP PRIMARY KEY,
    ADD PRIMARY KEY (`tag`, `rank`, `campersId`);
