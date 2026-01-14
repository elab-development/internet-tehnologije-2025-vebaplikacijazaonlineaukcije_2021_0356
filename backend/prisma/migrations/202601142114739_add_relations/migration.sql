/*
  Warnings:

  - Added the required column `categoryId` to the `Auction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `Auction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `auction` ADD COLUMN `categoryId` INTEGER NOT NULL,
    ADD COLUMN `sellerId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `Auction_sellerId_idx` ON `Auction`(`sellerId`);

-- CreateIndex
CREATE INDEX `Auction_categoryId_idx` ON `Auction`(`categoryId`);

-- CreateIndex
CREATE INDEX `Auction_status_idx` ON `Auction`(`status`);

-- CreateIndex
CREATE INDEX `Auction_endTime_idx` ON `Auction`(`endTime`);

-- AddForeignKey
ALTER TABLE `Auction` ADD CONSTRAINT `Auction_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Auction` ADD CONSTRAINT `Auction_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;