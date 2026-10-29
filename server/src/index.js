import "dotenv/config";
import app from "./app.js";

// Point d'entree du serveur GymOn
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`[GymOn API] Server running at http://localhost:${PORT}`);
});
