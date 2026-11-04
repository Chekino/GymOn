import "dotenv/config";
import prisma from "../src/config/db.js";

/**
 * Script de Seed pour GymOn.
 * Peuple le catalogue avec les vraies salles de sport de la métropole lilloise.
 * Utilise PostGIS (ST_MakePoint, ST_SetSRID, geography Point SRID 4326)
 * et vérifie l'existence pour être 100% idempotent.
 */

const GYMS = [
  {
    name: "Fitness Park Lille - Le 31",
    address: "7 Rue d'Amiens, 59800 Lille",
    city: "Lille",
    latitude: 50.6337,
    longitude: 3.0642,
  },
  {
    name: "Basic-Fit Lille Molinel",
    address: "31-33 Rue du Molinel, 59800 Lille",
    city: "Lille",
    latitude: 50.6345,
    longitude: 3.0685,
  },
  {
    name: "Basic-Fit Lille Nationale",
    address: "89 Rue Nationale, 59000 Lille",
    city: "Lille",
    latitude: 50.6351,
    longitude: 3.0582,
  },
  {
    name: "Basic-Fit Lille Wazemmes",
    address: "4 bis Rue des Sarrazins, 59000 Lille",
    city: "Lille",
    latitude: 50.6246,
    longitude: 3.0454,
  },
  {
    name: "Basic-Fit Lille Bigo Danel",
    address: "15 Boulevard Bigo Danel, 59000 Lille",
    city: "Lille",
    latitude: 50.6279,
    longitude: 3.0372,
  },
  {
    name: "Basic-Fit Lille Lillénium",
    address: "2 Rue du Faubourg des Postes, 59000 Lille",
    city: "Lille",
    latitude: 50.6159,
    longitude: 3.0465,
  },
  {
    name: "Keepcool Lille Centre",
    address: "10 Rue du Court Debout, 59800 Lille",
    city: "Lille",
    latitude: 50.6328,
    longitude: 3.0626,
  },
  {
    name: "Fitness Park Villeneuve-d'Ascq",
    address: "150 Boulevard de l'Ouest, 59650 Villeneuve-d'Ascq",
    city: "Villeneuve-d'Ascq",
    latitude: 50.6359,
    longitude: 3.1223,
  },
  {
    name: "Fitness Park Roubaix",
    address: "96 Mail de Lannoy, 59100 Roubaix",
    city: "Roubaix",
    latitude: 50.6892,
    longitude: 3.1815,
  },
];

async function main() {
  console.log(`[SEED] Debut de l'insertion des salles (${GYMS.length} au total)...`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const gym of GYMS) {
    const existing = await prisma.gym.findFirst({
      where: {
        name: gym.name,
        city: gym.city,
      },
    });

    if (existing) {
      console.log(`= [DEJA PRESENT] ${gym.name} (${gym.city})`);
      skippedCount++;
      continue;
    }

    await prisma.$queryRaw`
      INSERT INTO "gyms" (
        "id",
        "name",
        "address",
        "city",
        "latitude",
        "longitude",
        "location",
        "created_at",
        "updated_at"
      )
      VALUES (
        gen_random_uuid(),
        ${gym.name},
        ${gym.address},
        ${gym.city},
        ${gym.latitude},
        ${gym.longitude},
        ST_SetSRID(ST_MakePoint(${gym.longitude}, ${gym.latitude}), 4326)::geography,
        NOW(),
        NOW()
      )
    `;

    console.log(`+ [CREE] ${gym.name} (${gym.city})`);
    createdCount++;
  }

  console.log(`\n[SEED] Termine : ${createdCount} salle(s) creee(s), ${skippedCount} ignoree(s).`);
}

main()
  .catch((err) => {
    console.error("[SEED] Erreur critique :", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
