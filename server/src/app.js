import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();

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
