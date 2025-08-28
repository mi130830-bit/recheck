-- CreateTable
CREATE TABLE `BillingNote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bnNumber` VARCHAR(191) NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `customerId` INTEGER NOT NULL,

    UNIQUE INDEX `BillingNote_bnNumber_key`(`bnNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BillingNoteItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `billingNoteId` INTEGER NOT NULL,
    `orderId` INTEGER NOT NULL,

    UNIQUE INDEX `BillingNoteItem_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BillingNote` ADD CONSTRAINT `BillingNote_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingNoteItem` ADD CONSTRAINT `BillingNoteItem_billingNoteId_fkey` FOREIGN KEY (`billingNoteId`) REFERENCES `BillingNote`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BillingNoteItem` ADD CONSTRAINT `BillingNoteItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
