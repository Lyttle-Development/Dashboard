/*
  Warnings:

  - You are about to drop the column `name` on the `PrintMaterial` table. All the data in the column will be lost.
  - Added the required column `subType` to the `PrintMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "PrintMaterial_name_key";

-- AlterTable
ALTER TABLE "PrintMaterial" DROP COLUMN "name",
ADD COLUMN     "subType" TEXT NOT NULL;
