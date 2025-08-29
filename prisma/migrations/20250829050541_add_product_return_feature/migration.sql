-- AlterTable
ALTER TABLE `orderitem` ADD COLUMN `returnedQuantity` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `product_returns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `originalOrderId` INTEGER NOT NULL,
    `totalRefundAmount` DECIMAL(65, 30) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `return_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productReturnId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `priceAtReturn` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_returns` ADD CONSTRAINT `product_returns_originalOrderId_fkey` FOREIGN KEY (`originalOrderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `return_items` ADD CONSTRAINT `return_items_productReturnId_fkey` FOREIGN KEY (`productReturnId`) REFERENCES `product_returns`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `return_items` ADD CONSTRAINT `return_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
