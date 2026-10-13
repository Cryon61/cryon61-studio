-- CreateEnum
CREATE TYPE "LicenseMode" AS ENUM ('NONE', 'REQUIRED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "SourceMode" AS ENUM ('CLOSED_SOURCE', 'OPEN_SOURCE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "licenseMode" "LicenseMode" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "sourceMode" "SourceMode" NOT NULL DEFAULT 'CLOSED_SOURCE';
