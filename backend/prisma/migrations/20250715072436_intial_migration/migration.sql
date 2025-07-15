-- AlterTable
ALTER TABLE `purchase_orders` MODIFY `poDate` DATE NOT NULL DEFAULT (CURRENT_DATE);
