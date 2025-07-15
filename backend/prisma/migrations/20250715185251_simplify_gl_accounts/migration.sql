-- CreateTable
CREATE TABLE `purchase_orders` (
    `id` VARCHAR(191) NOT NULL,
    `vendorName` VARCHAR(255) NOT NULL,
    `oneTimeVendor` VARCHAR(255) NULL,
    `poDate` DATE NOT NULL DEFAULT (CURRENT_DATE),
    `poNumber` VARCHAR(50) NOT NULL,
    `customerSO` VARCHAR(255) NULL,
    `customerInvoice` VARCHAR(255) NULL,
    `apAccount` VARCHAR(255) NOT NULL,
    `transactionType` VARCHAR(50) NOT NULL,
    `transactionOrigin` VARCHAR(50) NULL,
    `shipVia` VARCHAR(50) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
    `totalAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchase_orders_poNumber_key`(`poNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gl_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `accountCode` VARCHAR(20) NOT NULL,
    `accountName` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gl_accounts_accountCode_key`(`accountCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchase_order_line_items` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseOrderId` VARCHAR(191) NOT NULL,
    `item` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `description` TEXT NULL,
    `glAccountId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `purchase_order_line_items` ADD CONSTRAINT `purchase_order_line_items_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchase_orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchase_order_line_items` ADD CONSTRAINT `purchase_order_line_items_glAccountId_fkey` FOREIGN KEY (`glAccountId`) REFERENCES `gl_accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
