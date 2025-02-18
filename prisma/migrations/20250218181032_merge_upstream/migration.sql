/*
  Warnings:

  - You are about to drop the column `friends` on the `ServicePrice` table. All the data in the column will be lost.
  - You are about to drop the column `friendsMax` on the `ServicePrice` table. All the data in the column will be lost.
  - You are about to drop the column `friendsMin` on the `ServicePrice` table. All the data in the column will be lost.
  - You are about to drop the column `standardMax` on the `ServicePrice` table. All the data in the column will be lost.
  - You are about to drop the column `standardMin` on the `ServicePrice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ServicePrice" DROP COLUMN "friends",
DROP COLUMN "friendsMax",
DROP COLUMN "friendsMin",
DROP COLUMN "standardMax",
DROP COLUMN "standardMin";
