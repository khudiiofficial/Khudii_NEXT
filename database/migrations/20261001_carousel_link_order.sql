-- Run once on an existing database before deploying the updated carousel code.
-- Adds per-banner new-tab behavior and persistent drag/drop display ordering.

ALTER TABLE `crousel_images`
  ADD COLUMN `open_new_tab` TINYINT(1) NOT NULL DEFAULT 0
    COMMENT 'Open the carousel slug in a new browser tab' AFTER `isMobile`,
  ADD COLUMN `sort_order` INT(11) NOT NULL DEFAULT 0
    COMMENT 'Display order within desktop or mobile carousel' AFTER `open_new_tab`;

-- Keep the existing relative order for current records.
UPDATE `crousel_images`
SET `sort_order` = `id`
WHERE `id` > 0 AND `sort_order` = 0;

CREATE INDEX `idx_crousel_images_device_order`
  ON `crousel_images` (`isMobile`, `sort_order`, `id`);
