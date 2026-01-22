-- CreateTable
CREATE TABLE `CartItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `finalPrice` DECIMAL(10, 2) NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `auctionId` INTEGER NOT NULL,

    INDEX `CartItem_userId_idx`(`userId`),
    INDEX `CartItem_auctionId_idx`(`auctionId`),
    INDEX `CartItem_addedAt_idx`(`addedAt`),
    UNIQUE INDEX `CartItem_userId_auctionId_key`(`userId`, `auctionId`),
    UNIQUE INDEX `CartItem_auctionId_key`(`auctionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `totalPrice` DECIMAL(10, 2) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `auctionId` INTEGER NOT NULL,

    INDEX `Order_userId_idx`(`userId`),
    INDEX `Order_auctionId_idx`(`auctionId`),
    INDEX `Order_orderDate_idx`(`orderDate`),
    UNIQUE INDEX `Order_userId_auctionId_key`(`userId`, `auctionId`),
    UNIQUE INDEX `Order_auctionId_key`(`auctionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_auctionId_fkey` FOREIGN KEY (`auctionId`) REFERENCES `Auction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_auctionId_fkey` FOREIGN KEY (`auctionId`) REFERENCES `Auction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;