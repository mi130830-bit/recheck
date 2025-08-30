-- DropForeignKey
ALTER TABLE `purchaseorder` DROP FOREIGN KEY `PurchaseOrder_supplierId_fkey`;

-- AlterTable
ALTER TABLE `purchaseorder` MODIFY `supplierId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
