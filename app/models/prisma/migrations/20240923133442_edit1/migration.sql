/*
  Warnings:

  - You are about to alter the column `image` on the `comments` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.
  - You are about to alter the column `imageAddress` on the `images` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.
  - You are about to alter the column `mainImage` on the `products` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.
  - You are about to alter the column `avatar` on the `user` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `comments` MODIFY `image` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `images` MODIFY `imageAddress` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` MODIFY `mainImage` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `avatar` VARCHAR(191) NULL;
