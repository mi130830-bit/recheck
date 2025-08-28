-- CreateTable
CREATE TABLE `Supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `taxId` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `fax` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `creditDays` INTEGER NULL,
    `paymentTerms` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Supplier_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberCode` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NULL,
    `nationalId` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `taxId` VARCHAR(191) NULL,
    `creditLimit` DOUBLE NULL,
    `address` VARCHAR(191) NULL,
    `shippingAddress` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `membershipExpiryDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Customer_memberCode_key`(`memberCode`),
    UNIQUE INDEX `Customer_nationalId_key`(`nationalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `alias` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NULL,
    `costPrice` DOUBLE NOT NULL,
    `retailPrice` DOUBLE NOT NULL,
    `wholesalePrice` DOUBLE NULL,
    `vatType` VARCHAR(191) NULL,
    `stockQuantity` INTEGER NOT NULL DEFAULT 0,
    `trackStock` BOOLEAN NOT NULL DEFAULT true,
    `reorderPoint` INTEGER NULL,
    `purchaseLimit` INTEGER NULL,
    `shelfLocation` VARCHAR(191) NULL,
    `expiryDate` DATETIME(3) NULL,
    `points` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `allowPriceEdit` BOOLEAN NOT NULL DEFAULT false,
    `supplierId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_barcode_key`(`barcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
