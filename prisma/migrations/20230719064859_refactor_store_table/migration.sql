/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Store_id_key` ON `Store`(`id`);
