-- CreateTable
CREATE TABLE `categorias_productos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `categorias_productos_tenantId_idx`(`tenantId`),
    UNIQUE INDEX `categorias_productos_tenantId_nombre_key`(`tenantId`, `nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `productos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `nombre` VARCHAR(150) NOT NULL,
    `descripcion` TEXT NULL,
    `codigo` VARCHAR(50) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `stockMinimo` INTEGER NOT NULL DEFAULT 5,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `categoriaId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `productos_tenantId_idx`(`tenantId`),
    INDEX `productos_categoriaId_idx`(`categoriaId`),
    UNIQUE INDEX `productos_tenantId_codigo_key`(`tenantId`, `codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `movimientos_inventario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenantId` INTEGER NOT NULL,
    `productoId` INTEGER NOT NULL,
    `tipo` ENUM('ENTRADA', 'SALIDA', 'AJUSTE') NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `stockAnterior` INTEGER NOT NULL,
    `stockNuevo` INTEGER NOT NULL,
    `motivo` VARCHAR(255) NULL,
    `observaciones` TEXT NULL,
    `fechaMovimiento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `movimientos_inventario_tenantId_idx`(`tenantId`),
    INDEX `movimientos_inventario_productoId_idx`(`productoId`),
    INDEX `movimientos_inventario_fechaMovimiento_idx`(`fechaMovimiento`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `categorias_productos` ADD CONSTRAINT `categorias_productos_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Negocio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `categorias_productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `productos` ADD CONSTRAINT `productos_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Negocio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_productoId_fkey` FOREIGN KEY (`productoId`) REFERENCES `productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `movimientos_inventario` ADD CONSTRAINT `movimientos_inventario_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Negocio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
