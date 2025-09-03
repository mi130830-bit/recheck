/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE `StockLedger` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('PURCHASE_IN', 'SALE_OUT', 'RETURN_IN', 'ADJUST_ADD', 'ADJUST_SUB') NOT NULL,
    `quantityChange` INTEGER NOT NULL,
    `newStockQuantity` INTEGER NOT NULL,
    `costAtTime` DECIMAL(65, 30) NULL,
    `priceAtTime` DECIMAL(65, 30) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `productId` INTEGER NOT NULL,
    `orderId` INTEGER NULL,
    `purchaseOrderId` INTEGER NULL,
    `returnId` INTEGER NULL,

    INDEX `StockLedger_productId_createdAt_idx`(`productId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `storeName` VARCHAR(191) NOT NULL DEFAULT 'My POS Store',
    `address` TEXT NULL,
    `phone` VARCHAR(191) NULL,
    `taxId` VARCHAR(191) NULL,
    `defaultVat` DECIMAL(65, 30) NOT NULL DEFAULT 7.00,
    `receiptNote` TEXT NULL,
    `receiptLogoUrl` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Customer_phone_idx` ON `Customer`(`phone`);

-- CreateIndex
CREATE UNIQUE INDEX `Customer_email_key` ON `Customer`(`email`);

-- AddForeignKey
ALTER TABLE `StockLedger` ADD CONSTRAINT `StockLedger_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
