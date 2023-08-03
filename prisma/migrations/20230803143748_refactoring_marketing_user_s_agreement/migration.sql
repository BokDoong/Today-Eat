-- AlterTable
ALTER TABLE `Notices` MODIFY `type` ENUM('NOTICE', 'FAQ', 'TERMS', 'MARKETING') NOT NULL;

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `agreement` DROP DEFAULT;
