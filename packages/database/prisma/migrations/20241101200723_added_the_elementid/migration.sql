/*
  Warnings:

  - Made the column `elementId` on table `mapElements` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "mapElements" ALTER COLUMN "elementId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "mapElements" ADD CONSTRAINT "mapElements_elementId_fkey" FOREIGN KEY ("elementId") REFERENCES "Element"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
