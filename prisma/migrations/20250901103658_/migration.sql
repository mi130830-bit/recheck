-- DropForeignKey
ALTER TABLE `billingnote` DROP FOREIGN KEY `BillingNote_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `product_returns` DROP FOREIGN KEY `product_returns_originalOrderId_fkey`;

-- AddForeignKey
ALTER TABLE `product_returns` ADD CONSTRAINT `product_returns_originalOrderId_fkey` FOREIGN KEY (`originalOrderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingNote` ADD CONSTRAINT `BillingNote_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
