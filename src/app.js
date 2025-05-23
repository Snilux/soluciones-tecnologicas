import express from "express";
import cors from "cors";
import path from "path";
import logger from "morgan";
import { fileURLToPath } from "url";
// Routes
import indexRoutes from "./routes/index-routes.js";
import usersRoutes from "./routes/users-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Config routes
app.use("/", indexRoutes);
app.use("/users", usersRoutes);

app.use(cors());
app.disable("x-powered-by");
app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => {
  res.status(404).render("error", { title: "Error" });
});

export default app;
