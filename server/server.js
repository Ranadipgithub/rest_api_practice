const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const swaggerUi = require("swagger-ui-express");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const connectDB = require("./src/config/db");
const swaggerSpec = require("./src/config/swagger");
const errorHandler = require("./src/middleware/errorHandler");

// Route files
const authRoutes = require("./src/routes/v1/auth");
const taskRoutes = require("./src/routes/v1/tasks");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// ---------- Security Middleware ----------

// Set security HTTP headers
app.use(helmet());

// Rate limiting: max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP. Please try again after 15 minutes.",
  },
});
app.use("/api", limiter);

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// ---------- General Middleware ----------

// Enable CORS
app.use(
  cors({
    origin:
      "https://rest-api-practice-iota.vercel.app" || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parser
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (dev only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ---------- API Documentation ----------

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Scalable REST API - Documentation",
  }),
);

// ---------- API Routes (v1) ----------

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);

// ---------- Health Check ----------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ---------- Root ----------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Scalable REST API - Welcome!",
    documentation: "/api-docs",
    health: "/api/health",
  });
});

// ---------- Error Handler ----------

app.use(errorHandler);

// ---------- Start Server ----------

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
