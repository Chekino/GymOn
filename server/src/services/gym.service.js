import {
  createGym,
  findGymById,
  findNearbyGyms,
  findAllGyms,
} from "../repositories/gym.repository.js";

/**
 * Couche Service pour les salles de sport.
 * Contient la logique metier et les conversions d'unites.
 */

export async function suggestGym({ name, address, city, latitude, longitude }) {
  return createGym({
    name: name.trim(),
    address: address.trim(),
    city: city.trim(),
    latitude,
    longitude,
  });
}

export async function getGymDetails(id) {
  const gym = await findGymById(id);

  if (!gym) {
    const error = new Error("Gym not found");
    error.statusCode = 404;
    error.code = "GYM_NOT_FOUND";
    throw error;
  }

  return gym;
}

export async function searchGyms({ near, radius, limit }) {
  const parsedLimit = limit ? Math.min(Math.max(Number(limit), 1), 100) : 20;

  // Si des coordonnees de proximite sont fournies (format: "lat,lng")
  if (near) {
    const [latStr, lngStr] = near.split(",");
    const latitude = Number(latStr);
    const longitude = Number(lngStr);

    // Rayon par defaut : 10 km (converti en metres pour PostGIS)
    const radiusKm = radius ? Number(radius) : 10;
    const radiusMeters = radiusKm * 1000;

    return findNearbyGyms({
      latitude,
      longitude,
      radiusMeters,
      limit: parsedLimit,
    });
  }

  // Sinon, liste standard par ordre alphabetique
  return findAllGyms({ limit: parsedLimit });
}
