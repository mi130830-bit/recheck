-- AlterTable
ALTER TABLE `billingnote` MODIFY `totalAmount` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `customer` MODIFY `creditLimit` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `change` DECIMAL(65, 30) NULL,
    ADD COLUMN `received` DECIMAL(65, 30) NULL,
    MODIFY `total` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `orderitem` MODIFY `price` DECIMAL(65, 30) NOT NULL,
    MODIFY `discount` DECIMAL(65, 30) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `product` MODIFY `costPrice` DECIMAL(65, 30) NOT NULL,
    MODIFY `retailPrice` DECIMAL(65, 30) NOT NULL,
    MODIFY `wholesalePrice` DECIMAL(65, 30) NULL;

-- AlterTable
ALTER TABLE `purchaseorder` MODIFY `totalCost` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `purchaseorderitem` MODIFY `costPrice` DECIMAL(65, 30) NOT NULL;
