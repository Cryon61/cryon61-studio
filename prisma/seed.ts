import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = ["Roblox Systems","Fishing","Hangout","UI","Scripts","Modules","Maps","Models","VFX","SFX","Tools","Plugins","Vehicles","NPC","Other"];
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function main() {
  for (const [i, name] of CATEGORIES.entries()) {
    await prisma.category.upsert({ where: { slug: slugify(name) }, update: {}, create: { name, slug: slugify(name), sortOrder: i } });
  }

  // OWNER comes from environment only. Never hardcoded.
  const { OWNER_EMAIL, OWNER_PASSWORD, OWNER_USERNAME = "owner" } = process.env;
  if (OWNER_EMAIL && OWNER_PASSWORD) {
    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: OWNER_EMAIL.toLowerCase() },
      update: { role: "OWNER" }, // password is NOT overwritten on re-seed
      create: { email: OWNER_EMAIL.toLowerCase(), username: OWNER_USERNAME, passwordHash, role: "OWNER", emailVerified: new Date(), profile: { create: {} } },
    });
    console.log("Owner account ensured.");
  } else {
    console.warn("OWNER_EMAIL / OWNER_PASSWORD not set — owner account skipped.");
  }

  const fishing = await prisma.category.findUnique({ where: { slug: "fishing" } });
  const demos = [
    { slug: "fishing-system-v3", name: "Fishing System V3", price: 150000, featured: true, description: "Complete fishing system with rods, bait, rarity and UI. (Demo product)" },
    { slug: "hangout-ui-kit", name: "Hangout UI Kit", price: 75000, featured: false, description: "Modern UI kit for hangout games. (Demo product)" },
  ];
  for (const p of demos) {
    await prisma.product.upsert({
      where: { slug: p.slug }, update: {},
      create: {
        ...p, status: "PUBLISHED", features: ["Demo feature A", "Demo feature B"],
        versions: { create: { version: "1.0.0", changelog: "Initial release", isLatest: true } },
        categories: fishing ? { create: { categoryId: fishing.id } } : undefined,
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
