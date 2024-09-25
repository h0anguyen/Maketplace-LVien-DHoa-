/*
  Warnings:

  - You are about to alter the column `image` on the `comments` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `imageAddress` on the `images` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `mainImage` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `avatar` on the `user` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `comments` MODIFY `image` JSON NULL;

-- AlterTable
ALTER TABLE `images` MODIFY `imageAddress` JSON NULL;

-- AlterTable
ALTER TABLE `products` MODIFY `mainImage` JSON NULL;

-- AlterTable
ALTER TABLE `user` MODIFY `avatar` JSON NULL;
