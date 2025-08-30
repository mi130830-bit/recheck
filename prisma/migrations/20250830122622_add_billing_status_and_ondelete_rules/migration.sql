-- DropForeignKey
ALTER TABLE `billingnote` DROP FOREIGN KEY `BillingNote_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `billingnoteitem` DROP FOREIGN KEY `BillingNoteItem_billingNoteId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `purchaseorderitem` DROP FOREIGN KEY `PurchaseOrderItem_purchaseOrderId_fkey`;

-- AlterTable
ALTER TABLE `billingnote` ADD COLUMN `paidAt` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE `PurchaseOrderItem` ADD CONSTRAINT `PurchaseOrderItem_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingNote` ADD CONSTRAINT `BillingNote_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingNoteItem` ADD CONSTRAINT `BillingNoteItem_billingNoteId_fkey` FOREIGN KEY (`billingNoteId`) REFERENCES `BillingNote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
