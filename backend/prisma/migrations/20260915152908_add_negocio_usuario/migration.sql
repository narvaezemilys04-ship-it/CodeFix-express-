/*
  Warnings:

  - You are about to drop the `pruebaconexion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `pruebaconexion`;

-- CreateTable
CREATE TABLE `Negocio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `nit` VARCHAR(30) NOT NULL,
    `tarifaIvaDefault` DECIMAL(5, 2) NOT NULL DEFAULT 19.00,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Negocio_nit_key`(`nit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `correo` VARCHAR(150) NOT NULL,
    `contraseñaHash` VARCHAR(255) NOT NULL,
    `rol` ENUM('ADMIN', 'VENDEDOR', 'CONTADOR') NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creadoEn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Usuario_correo_key`(`correo`),
    INDEX `Usuario_tenantId_idx`(`tenantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Negocio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
