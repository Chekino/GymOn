import prisma from "../config/db.js";

/**
 * Couche Repository pour les salles de sport (Gyms).
 * Gere les requetes classiques et les requetes spatiales PostGIS.
 */

export async function createGym({ name, address, city, latitude, longitude }) {
  // Insertion avec conversion spatiale en PostGIS geography Point SRID 4326
  const [gym] = await prisma.$queryRaw`
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
      ${name},
      ${address},
      ${city},
      ${latitude},
      ${longitude},
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      NOW(),
      NOW()
    )
    RETURNING
      "id",
      "name",
      "address",
      "city",
      "latitude",
      "longitude",
      "created_at" AS "createdAt",
      "updated_at" AS "updatedAt"
  `;

  return gym;
}

export async function findGymById(id) {
  return prisma.gym.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      latitude: true,
      longitude: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findNearbyGyms({ latitude, longitude, radiusMeters, limit = 20 }) {
  // Recherche spatiale ultra-rapide via index GIST et calcul de la distance en metres
  const gyms = await prisma.$queryRaw`
    SELECT
      "id",
      "name",
      "address",
      "city",
      "latitude",
      "longitude",
      "created_at" AS "createdAt",
      ROUND(ST_Distance("location", ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography))::int AS "distanceMeters"
    FROM "gyms"
    WHERE ST_DWithin(
      "location",
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      ${radiusMeters}
    )
    ORDER BY "distanceMeters" ASC
    LIMIT ${limit}
  `;

  return gyms;
}

export async function findAllGyms({ limit = 20 }) {
  return prisma.gym.findMany({
    take: limit,
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      latitude: true,
      longitude: true,
      createdAt: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
