/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `Receipt` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `userId` on the `Receipt` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_orderId_key" ON "Receipt"("orderId");
