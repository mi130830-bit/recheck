-- CreateIndex
CREATE FULLTEXT INDEX `Product_name_alias_barcode_idx` ON `Product`(`name`, `alias`, `barcode`);
