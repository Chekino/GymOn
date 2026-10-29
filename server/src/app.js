import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import gymRoutes from "./routes/gym.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import participationRoutes from "./routes/participation.routes.js";

const app = express();

// Securise les en-tetes HTTP
app.use(helmet());

// Autorise les requetes cross-origin du client web
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// Parse JSON body payloads
app.use(express.json());

// Route de diagnostic / santé
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

// Routes API v1
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/gyms", gymRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/participations", participationRoutes);

// Gestionnaire 404 pour les routes inconnues
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

// Gestionnaire d'erreurs centralise (Express error middleware)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected error occurred",
    },
  });
});

export default app;
