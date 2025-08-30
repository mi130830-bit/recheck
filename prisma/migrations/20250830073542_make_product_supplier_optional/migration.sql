/*
  Warnings:

  - Made the column `supplierId` on table `purchaseorder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `purchaseorder` DROP FOREIGN KEY `PurchaseOrder_supplierId_fkey`;

-- AlterTable
ALTER TABLE `purchaseorder` MODIFY `supplierId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
