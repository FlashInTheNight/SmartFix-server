-- CreateTable
CREATE TABLE "ShoppingCart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "partId" INTEGER NOT NULL DEFAULT 0,
    "boiler_manufacturer" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "parts_manufacturer" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "in_stock" INTEGER NOT NULL DEFAULT 0,
    "count" INTEGER NOT NULL DEFAULT 1,
    "total_price" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ShoppingCart_pkey" PRIMARY KEY ("id")
);
